package com.example.howudoin.controller;

import com.example.howudoin.model.Message;
import com.example.howudoin.service.JwtService;
import com.example.howudoin.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
// MessageController.java
@RestController
@RequestMapping("/api/messages")
@Slf4j
public class MessageController {
    @Autowired
    private JwtService jwtService;

    @Autowired
    private MessageService messageService;



    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String receiverId,
            @RequestBody String content) {
        try {
            String senderId = jwtService.extractUserIdFromHeader(authorizationHeader);
            log.info("Attempting to send message: senderId={}, receiverId={}", senderId, receiverId);

            // Token'dan çıkarılan userId'yi kontrol et
            log.info("Token content: {}", authorizationHeader);
            log.info("Extracted senderId: {}", senderId);

            Message message = messageService.sendDirectMessage(senderId, receiverId, content);
            log.info("Message sent successfully: {}", message);

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Error sending message", e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String userId2) {
        try {
            String userId1 = jwtService.extractUserIdFromHeader(authorizationHeader);
            log.info("Fetching messages between users: {} and {}", userId1, userId2);

            List<Message> messages = messageService.getDirectMessages(userId1, userId2);
            log.info("Found {} messages", messages.size());

            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("Error fetching messages", e);
            throw e;
        }
    }
}