package com.example.howudoin.controller;

import com.example.howudoin.dto.UserResponse;
import com.example.howudoin.model.User;
import com.example.howudoin.repository.UserRepository;
import com.example.howudoin.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/find-by-email")
    public ResponseEntity<User> findUserByEmail(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String email) {
        try {

            String userId = jwtService.extractUserIdFromHeader(authorizationHeader);

            return userRepository.findByEmail(email)
                    .map(user -> {

                        user.setPassword(null);
                        return ResponseEntity.ok(user);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/find-by-email2")
    public ResponseEntity<?> findUserByEmail2(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String email) {
        try {
            // Extract user ID from JWT token
            String userId = jwtService.extractUserIdFromHeader(authorizationHeader);

            // Fetch user by email
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Convert User entity to UserResponse DTO
                UserResponse userResponse = UserResponse.fromUser(user);
                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authorization header");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }
    @GetMapping("/find/{userId}")
    public ResponseEntity<User> findUserById(@PathVariable String userId) {
        log.info("Fetching user with ID: {}", userId);  // Log ekle
        return userRepository.findById(userId)
                .map(user -> {
                    log.info("Found user: {}", user.getEmail());  // Log ekle
                    User response = new User();
                    response.setId(user.getId());
                    response.setEmail(user.getEmail());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}