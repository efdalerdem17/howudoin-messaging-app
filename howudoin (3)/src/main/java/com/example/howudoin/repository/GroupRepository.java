package com.example.howudoin.repository;

import com.example.howudoin.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface GroupRepository extends MongoRepository<Group, String> {
}