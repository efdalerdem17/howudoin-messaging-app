package com.example.howudoin.controller;

import com.example.howudoin.model.Group;
import com.example.howudoin.model.Message;
import com.example.howudoin.service.GroupService;
import com.example.howudoin.service.JwtService;
import com.example.howudoin.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// GroupController.java
@RestController
@RequestMapping("/api/groups")
@Slf4j
public class GroupController {
    @Autowired
    private JwtService jwtService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private MessageService messageService;

    // Add this new endpoint
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups(
            @RequestHeader("Authorization") String authorizationHeader) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        return ResponseEntity.ok(groupService.getGroupsForUser(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<Group> createGroup(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Group group) {
        String creatorId = jwtService.extractUserIdFromHeader(authorizationHeader);

        return ResponseEntity.ok(groupService.createGroup(group.getName(), creatorId, group.getMemberIds()));
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<Group> addMember(
            @PathVariable String groupId,
            @RequestParam String memberId) {
        return ResponseEntity.ok(groupService.addMember(groupId, memberId));
    }

    @PostMapping("/{groupId}/send")
    public ResponseEntity<Message> sendMessage(
            @PathVariable String groupId,
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody String content) {
        String senderId = jwtService.extractUserIdFromHeader(authorizationHeader);
        return ResponseEntity.ok(messageService.sendGroupMessage(senderId, groupId, content));
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String groupId) {
        return ResponseEntity.ok(messageService.getGroupMessages(groupId));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<String>> getMembers(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getGroupMembers(groupId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroupById(
            @PathVariable String groupId,
            @RequestHeader("Authorization") String authorizationHeader) {
        String userId = jwtService.extractUserIdFromHeader(authorizationHeader);
        return groupService.getGroupById(groupId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}