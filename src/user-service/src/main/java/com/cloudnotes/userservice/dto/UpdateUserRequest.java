package com.cloudnotes.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/** Partial update of a user profile. Null fields are left unchanged. */
public class UpdateUserRequest {

    @Size(max = 100)
    private String displayName;

    @Email
    private String email;

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
