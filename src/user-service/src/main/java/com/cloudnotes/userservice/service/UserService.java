package com.cloudnotes.userservice.service;

import com.cloudnotes.userservice.dto.UpdateUserRequest;
import com.cloudnotes.userservice.model.User;
import com.cloudnotes.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return repo.findByUsernameIgnoreCase(username);
    }

    @Transactional
    public Optional<User> update(UUID id, UpdateUserRequest req) {
        return repo.findById(id).map(user -> {
            if (req.getDisplayName() != null) {
                user.setDisplayName(req.getDisplayName());
            }
            if (req.getEmail() != null && !req.getEmail().equalsIgnoreCase(user.getEmail())) {
                if (repo.existsByEmailIgnoreCase(req.getEmail())) {
                    throw new IllegalStateException("Email already in use");
                }
                user.setEmail(req.getEmail());
            }
            return repo.save(user);
        });
    }

    @Transactional
    public boolean delete(UUID id) {
        if (!repo.existsById(id)) {
            return false;
        }
        repo.deleteById(id);
        return true;
    }

    @Transactional(readOnly = true)
    public long count() {
        return repo.count();
    }
}
