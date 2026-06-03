package com.cloudnotes.userservice.service;

import com.cloudnotes.userservice.model.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// In-memory store — replace with Spring Data JPA + PostgreSQL (see README)
@Service
public class UserService {

    private final Map<String, User> store = new ConcurrentHashMap<>();

    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    public Optional<User> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Optional<User> findByUsername(String username) {
        return store.values().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst();
    }

    public User create(User user) {
        store.put(user.getId(), user);
        return user;
    }

    public Optional<User> update(String id, User patch) {
        return findById(id).map(existing -> {
            if (patch.getDisplayName() != null) existing.setDisplayName(patch.getDisplayName());
            if (patch.getEmail()       != null) existing.setEmail(patch.getEmail());
            existing.setUpdatedAt(Instant.now());
            return existing;
        });
    }

    public boolean delete(String id) {
        return store.remove(id) != null;
    }

    public int count() {
        return store.size();
    }
}
