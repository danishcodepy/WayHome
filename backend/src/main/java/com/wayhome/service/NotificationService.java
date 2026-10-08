package com.wayhome.service;

import com.wayhome.model.Notification;
import com.wayhome.model.User;
import com.wayhome.repository.NotificationRepository;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public Notification create(Long userId, String title, String body) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Notification saved = notificationRepository.save(Notification.builder().user(user).title(title).body(body).build());
        auditLogService.log(null, "CREATE", "Notification", saved.getId(), "Notification created for user: " + user.getName() + " - " + title);
        return saved;
    }
    public List<Notification> listForUser(Long userId) { return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId); }
    public long unreadCount(Long userId) { return notificationRepository.countByUserIdAndReadFalse(userId); }
    public void markAllRead(Long userId) { notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).forEach(n -> n.setRead(true)); notificationRepository.saveAll(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)); auditLogService.log(userId, "READ", "Notification", null, "All notifications marked as read"); }
    public Notification markRead(Long id, Long userId, boolean admin) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        if (!admin && (notification.getUser() == null || !userId.equals(notification.getUser().getId()))) throw new IllegalArgumentException("You cannot update this notification");
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        auditLogService.log(userId, "READ", "Notification", id, "Notification marked as read");
        return saved;
    }
}
