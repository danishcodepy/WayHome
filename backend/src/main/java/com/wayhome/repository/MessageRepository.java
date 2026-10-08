package com.wayhome.repository;

import com.wayhome.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /** All messages sent to or from a user. */
    List<Message> findBySenderIdOrReceiverId(Long senderId, Long receiverId);

    /** Full conversation between two users, oldest first. */
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
            Long senderIdA, Long receiverIdA, Long senderIdB, Long receiverIdB);
}
