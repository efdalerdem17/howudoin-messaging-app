package com.example.howudoin.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Data
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String creatorId;
    private List<String> memberIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
}