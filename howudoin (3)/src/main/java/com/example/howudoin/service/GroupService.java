package com.example.howudoin.service;


import com.example.howudoin.model.Group;
import com.example.howudoin.repository.GroupRepository;
import com.example.howudoin.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Group> getGroupsForUser(String userId) {
        List<Group> allGroups = groupRepository.findAll();
        return allGroups.stream()
                .filter(group -> group.getMemberIds().contains(userId) ||
                        group.getCreatorId().equals(userId))
                .collect(Collectors.toList());
    }
    public Group createGroup(String name, String creatorId, List<String> memberIds) {
        Group group = new Group();
        group.setName(name);
        group.setCreatorId(creatorId);
        group.getMemberIds().add(creatorId);
        group.getMemberIds().addAll(memberIds);
        return groupRepository.save(group);
    }

    public Group addMember(String groupId, String userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getMemberIds().contains(userId)) {
            group.getMemberIds().add(userId);
            return groupRepository.save(group);
        }

        throw new RuntimeException("User is already a member");
    }

    public List<String> getGroupMembers(String groupId) {
        return groupRepository.findById(groupId)
                .map(Group::getMemberIds)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }
    public Optional<Group> getGroupById(String groupId, String userId) {
        return groupRepository.findById(groupId)
                .filter(group -> group.getMemberIds().contains(userId));
    }
}