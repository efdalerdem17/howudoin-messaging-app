package com.example.howudoin.service;
import com.example.howudoin.model.Message;
import com.example.howudoin.model.User;
import com.example.howudoin.model.Group;
import com.example.howudoin.repository.MessageRepository;
import com.example.howudoin.repository.UserRepository;
import com.example.howudoin.repository.GroupRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    public Message sendDirectMessage(String senderId, String receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        if (!sender.getFriends().contains(receiver.getEmail())) {
            throw new RuntimeException("Users are not friends");
        }

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setMessageType("DIRECT");

        return messageRepository.save(message);
    }

    public Message sendGroupMessage(String senderId, String groupId, String content) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getMemberIds().contains(senderId)) {
            throw new RuntimeException("User is not a member of this group");
        }

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(groupId);
        message.setContent(content);
        message.setMessageType("GROUP");

        return messageRepository.save(message);
    }

    public List<Message> getDirectMessages(String userId1, String userId2) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderBySentAtDesc(
                userId1, userId2, userId1, userId2);
    }

    public List<Message> getGroupMessages(String groupId) {
        return messageRepository.findByReceiverIdAndMessageTypeOrderBySentAtDesc(groupId, "GROUP");
    }
}