package com.example.howudoin.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Data
public class LoginRequest {
    private String email;
    private String password;
}