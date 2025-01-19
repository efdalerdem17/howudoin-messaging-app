package com.example.howudoin.service;

import com.example.howudoin.model.User;
import com.example.howudoin.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import static com.example.howudoin.model.User.FriendRequest.RequestStatus.PENDING;

@Service
@Slf4j
public class FriendService {

    @Autowired
    private UserRepository userRepository;

    public void sendFriendRequest(String senderEmail, String receiverEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        User.FriendRequest request = new User.FriendRequest();

        request.setSenderEmail(senderEmail);
        request.setReceiverEmail(receiverEmail);
        request.setStatus(PENDING);

        receiver.getFriendRequests().add(request);
        userRepository.save(receiver);
    }

    public void acceptFriendRequest(String userEmail, String senderEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getFriendRequests().stream()
                .filter(req -> req.getSenderEmail().equals(senderEmail) && req.getStatus().equals(PENDING))
                .findFirst()
                .ifPresent(request -> {
                    request.setStatus(User.FriendRequest.RequestStatus.ACCEPTED);
                    user.getFriends().add(senderEmail);

                    User sender = userRepository.findByEmail(senderEmail).orElseThrow();
                    sender.getFriends().add(userEmail);
                    userRepository.save(sender);
                });
        userRepository.save(user);
    }
    public List<String> getPendingFriendRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getFriendRequests().stream()
                .filter(req -> req.getStatus().equals(PENDING))
                .map(User.FriendRequest::getSenderEmail)
                .toList();
    }

    public void rejectFriendRequest(String userEmail, String senderEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getFriendRequests().stream()
                .filter(req -> req.getSenderEmail().equals(senderEmail) && req.getStatus().equals(PENDING))
                .findFirst()
                .ifPresent(request -> {
                    request.setStatus(User.FriendRequest.RequestStatus.REJECTED);

                });
        userRepository.save(user);
    }
}