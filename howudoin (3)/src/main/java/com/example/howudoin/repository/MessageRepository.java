package com.example.howudoin.repository;

import com.example.howudoin.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderBySentAtDesc(
            String senderId, String receiverId, String receiverId2, String senderId2);
    List<Message> findByReceiverIdAndMessageTypeOrderBySentAtDesc(String groupId, String messageType);

}