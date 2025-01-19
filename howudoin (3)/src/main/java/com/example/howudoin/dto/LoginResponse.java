package com.example.howudoin.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class LoginResponse {

    private String token;

    private long expiresIn;

}
