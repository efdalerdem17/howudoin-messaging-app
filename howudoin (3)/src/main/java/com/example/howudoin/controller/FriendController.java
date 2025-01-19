package com.example.howudoin.controller;

import com.example.howudoin.model.User;
import com.example.howudoin.repository.UserRepository;
import com.example.howudoin.service.FriendService;
import com.example.howudoin.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@RequestMapping("/api")
@RestController
public class FriendController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserRepository userRepository;


    @GetMapping("/friends")
    public ResponseEntity<List<String>> seeFriends(@RequestHeader("Authorization") String authorizationHeader) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Fetching friends for user: " + user.getEmail());
        System.out.println("Friends list: " + user.getFriends());
        return ResponseEntity.ok(user.getFriends());
    }

    @PostMapping("/friends/add")
    public ResponseEntity<String> sendFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String receiverEmail) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String senderEmail = user.getEmail();
        friendService.sendFriendRequest(senderEmail, receiverEmail);
        return ResponseEntity.ok("Friend is added successfully");
    }


    @PostMapping("/friends/accept")
    public ResponseEntity<String> acceptRequest(@RequestHeader("Authorization") String authorizationHeader,
                                                            @RequestParam String senderEmail) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String userEmail = user.getEmail();
        friendService.acceptFriendRequest(userEmail, senderEmail);
        return ResponseEntity.ok("Friend is accepted successfully");
    }
    @GetMapping("/friends/pending")
    public ResponseEntity<List<String>> getPendingFriendRequests(
            @RequestHeader("Authorization") String authorizationHeader) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(friendService.getPendingFriendRequests(user.getEmail()));
    }


    @PostMapping("/reject")
    public ResponseEntity<String> rejectRequest(@RequestHeader("Authorization") String authorizationHeader,
                                                            @RequestParam String senderEmail) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String userEmail = user.getEmail();
        friendService.rejectFriendRequest(userEmail, senderEmail);
        return ResponseEntity.ok("Friend is rejected");
    }
}
