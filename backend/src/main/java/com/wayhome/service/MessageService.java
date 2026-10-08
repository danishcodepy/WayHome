package com.wayhome.service;

import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Message;
import com.wayhome.model.Property;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.repository.MessageRepository;
import com.wayhome.repository.PropertyRepository;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public Message send(Long senderId, Long receiverId, Long propertyId, String content) {
        if (content == null || content.isBlank() || content.length() > 5000) {
            throw new IllegalArgumentException("Message must contain 1–5000 characters");
        }
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Property property = null;
        if (propertyId != null) {
            property = propertyRepository.findById(propertyId).orElseThrow(() -> new IllegalArgumentException("Property not found"));
            Long ownerId = property.getOwner() == null ? null : property.getOwner().getId();
            if (ownerId != null && !ownerId.equals(senderId) && !ownerId.equals(receiverId)) {
                throw new ForbiddenException("Conversation is not related to this property");
            }
            if (ownerId != null && !ownerId.equals(senderId) && receiver.getRole() != Role.PROPERTY_MANAGER && receiver.getRole() != Role.ADMIN) {
                throw new IllegalArgumentException("Property enquiries must be sent to the property manager");
            }
        }
        if (sender.getId().equals(receiver.getId())) throw new IllegalArgumentException("You cannot message yourself");
        Message saved = messageRepository.save(Message.builder()
                .sender(sender)
                .receiver(receiver)
                .property(property)
                .content(content.trim())
                .read(false)
                .build());
        auditLogService.log(senderId, "SEND", "Message", saved.getId(), "Message sent to user: " + receiver.getName());
        notificationService.create(receiverId, "New message", "You received a new message from " + sender.getName());
        return saved;
    }

    @Transactional
    public List<Message> conversation(Long actorId, Long otherUserId) {
        if (actorId == null || otherUserId == null) throw new IllegalArgumentException("Both participants are required");
        List<Message> messages = messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                actorId, otherUserId, otherUserId, actorId);
        messages.stream()
                .filter(message -> message.getReceiver() != null && actorId.equals(message.getReceiver().getId()) && !Boolean.TRUE.equals(message.getRead()))
                .forEach(message -> message.setRead(true));
        return messages;
    }

    @Transactional(readOnly = true)
    public List<Message> listForUser(Long userId) {
        return messageRepository.findBySenderIdOrReceiverId(userId, userId);
    }
}
