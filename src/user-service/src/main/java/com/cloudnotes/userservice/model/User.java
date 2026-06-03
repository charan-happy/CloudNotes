package com.cloudnotes.userservice.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public class User {
    private String id;

    @NotBlank
    @Size(min = 3, max = 30)
    private String username;

    @NotBlank
    @Email
    private String email;

    private String displayName;
    private Instant createdAt;
    private Instant updatedAt;

    public User() {}

    public User(String username, String email, String displayName) {
        this.id          = UUID.randomUUID().toString();
        this.username    = username;
        this.email       = email;
        this.displayName = displayName;
        this.createdAt   = Instant.now();
        this.updatedAt   = Instant.now();
    }

    // Getters & setters
    public String getId()          { return id; }
    public void   setId(String v)  { this.id = v; }

    public String getUsername()           { return username; }
    public void   setUsername(String v)   { this.username = v; }

    public String getEmail()              { return email; }
    public void   setEmail(String v)      { this.email = v; }

    public String getDisplayName()        { return displayName; }
    public void   setDisplayName(String v){ this.displayName = v; }

    public Instant getCreatedAt()         { return createdAt; }
    public void    setCreatedAt(Instant v){ this.createdAt = v; }

    public Instant getUpdatedAt()         { return updatedAt; }
    public void    setUpdatedAt(Instant v){ this.updatedAt = v; }
}
