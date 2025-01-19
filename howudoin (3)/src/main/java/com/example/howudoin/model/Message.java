package com.example.howudoin.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;

    private String senderId;
    private String receiverId; // userId or groupId
    private String content;
    private String messageType;   // DIRECT or GROUP
    private LocalDateTime sentAt = LocalDateTime.now();

}