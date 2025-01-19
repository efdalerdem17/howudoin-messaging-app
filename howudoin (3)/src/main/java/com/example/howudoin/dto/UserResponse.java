package com.example.howudoin.dto;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String name;
    private String lastName;
    private String email;

    public static UserResponse fromUser(com.example.howudoin.model.User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setLastName(user.getLastname());
        response.setEmail(user.getEmail());
        return response;
    }
}