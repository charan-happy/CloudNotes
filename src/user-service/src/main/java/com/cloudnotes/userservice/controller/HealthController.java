package com.cloudnotes.userservice.controller;

import com.cloudnotes.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Unauthenticated liveness / readiness endpoints (used by k8s probes & the UI). */
@RestController
public class HealthController {

    private final UserService userService;
    private final JdbcTemplate jdbc;

    public HealthController(UserService userService, JdbcTemplate jdbc) {
        this.userService = userService;
        this.jdbc = jdbc;
    }

    @GetMapping("/")
    public Map<String, String> liveness() {
        return Map.of("status", "User Service is running!");
    }

    @GetMapping("/v1/health-status")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbOk;
        long userCount = 0;
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            userCount = userService.count();
            dbOk = true;
        } catch (Exception e) {
            dbOk = false;
        }

        Map<String, Object> body = Map.of(
                "service", "user-service",
                "version", "1.0.0",
                "status", dbOk ? "healthy" : "degraded",
                "language", "Java",
                "framework", "Spring Boot 3.5",
                "database", dbOk ? "connected" : "unreachable",
                "user_count", userCount,
                "endpoints", List.of(
                        Map.of("method", "GET", "path", "/v1/health-status", "description", "Readiness + DB health"),
                        Map.of("method", "GET", "path", "/actuator/prometheus", "description", "Prometheus metrics"),
                        Map.of("method", "GET", "path", "/v1/users", "description", "List users"),
                        Map.of("method", "GET", "path", "/v1/users/{id}", "description", "Get user by ID"),
                        Map.of("method", "PUT", "path", "/v1/users/{id}", "description", "Update profile"),
                        Map.of("method", "DELETE", "path", "/v1/users/{id}", "description", "Delete user")
                )
        );
        return dbOk ? ResponseEntity.ok(body) : ResponseEntity.status(503).body(body);
    }
}
