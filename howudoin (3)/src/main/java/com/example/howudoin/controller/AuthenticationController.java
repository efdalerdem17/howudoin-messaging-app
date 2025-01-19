package com.example.howudoin.controller;

import com.example.howudoin.dto.LoginRequest;
import com.example.howudoin.dto.LoginResponse;
import com.example.howudoin.dto.RegisterRequest;
import com.example.howudoin.model.User;
import com.example.howudoin.service.AuthenticationService;
import com.example.howudoin.service.JwtService;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);

        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginRequest loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", authenticatedUser.getId());
        String jwtToken = jwtService.generateToken(extraClaims,authenticatedUser);

        LoginResponse loginResponse  = new LoginResponse();
        loginResponse .setToken(jwtToken);
        loginResponse .setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }
}
