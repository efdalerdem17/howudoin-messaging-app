package com.example.howudoin.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.Accessors;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Document(collection = "users")
@Accessors(chain = true) // Enables chaining for setters
public class User implements UserDetails {
    @Id
    private String id;

    private String name;
    private String lastname;
    private String email;

    @Getter
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private List<String> friends = new ArrayList<>();
    private List<FriendRequest> friendRequests = new ArrayList<>();

    @Data
    public static class FriendRequest {
        private String senderEmail;
        private String receiverEmail;
        private RequestStatus status; // PENDING, ACCEPTED, REJECTED
        private LocalDateTime createdAt = LocalDateTime.now();

        public enum RequestStatus {
            PENDING,
            ACCEPTED,
            REJECTED
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}