package com.cloudnotes.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps the shared `users` table. The user-service owns the PROFILE view:
 * it reads users (created by auth-service on /register) and updates display
 * name / email. It never touches password_hash — that column is read-only here.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    // Username is set at registration by auth-service; immutable from here.
    @Column(nullable = false, unique = true, updatable = false)
    private String username;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Size(max = 100)
    @Column(name = "display_name")
    private String displayName;

    // Owned by auth-service. Mapped only so Hibernate schema validation passes;
    // never inserted or updated from this service.
    @Column(name = "password_hash", insertable = false, updatable = false)
    private String passwordHash;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
