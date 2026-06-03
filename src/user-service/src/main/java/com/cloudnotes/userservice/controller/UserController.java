package com.cloudnotes.userservice.controller;

import com.cloudnotes.userservice.model.User;
import com.cloudnotes.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public Map<String, String> health() {
        return Map.of("status", "User Service is running!");
    }

    @GetMapping("/v1/health-status")
    public Map<String, Object> healthDetail() {
        return Map.of(
            "service",   "user-service",
            "version",   "1.0.0",
            "status",    "healthy",
            "language",  "Java",
            "framework", "Spring Boot 3.5",
            "user_count", userService.count(),
            "endpoints", List.of(
                Map.of("method", "GET",    "path", "/v1/users",     "description", "List all users"),
                Map.of("method", "POST",   "path", "/v1/users",     "description", "Create a user"),
                Map.of("method", "GET",    "path", "/v1/users/:id", "description", "Get user by ID"),
                Map.of("method", "PUT",    "path", "/v1/users/:id", "description", "Update a user"),
                Map.of("method", "DELETE", "path", "/v1/users/:id", "description", "Delete a user"),
                Map.of("method", "GET",    "path", "/v1/users/by-username/:username", "description", "Lookup by username")
            )
        );
    }

    @GetMapping("/v1/users")
    public List<User> list() {
        return userService.findAll();
    }

    @PostMapping("/v1/users")
    public ResponseEntity<User> create(@Valid @RequestBody User user) {
        User created = new User(user.getUsername(), user.getEmail(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(created));
    }

    @GetMapping("/v1/users/{id}")
    public ResponseEntity<User> get(@PathVariable String id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/v1/users/by-username/{username}")
    public ResponseEntity<User> byUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/v1/users/{id}")
    public ResponseEntity<User> update(@PathVariable String id, @RequestBody User patch) {
        return userService.update(id, patch)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/v1/users/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        if (!userService.delete(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("message", "user deleted"));
    }
}
