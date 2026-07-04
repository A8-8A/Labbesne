package com.labbesne.controller;

import com.labbesne.dto.Dtos.*;
import com.labbesne.entity.User;
import com.labbesne.repository.UserRepository;
import com.labbesne.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (users.existsByEmail(req.email()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered"));
        User.Role role = "OWNER".equalsIgnoreCase(req.role()) ? User.Role.OWNER : User.Role.CUSTOMER;
        User user = User.builder().name(req.name()).email(req.email().toLowerCase())
                .passwordHash(encoder.encode(req.password())).phone(req.phone()).role(role).build();
        users.save(user);
        return ResponseEntity.ok(new AuthResponse(jwt.generate(user), user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var user = users.findByEmail(req.email().toLowerCase()).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getPasswordHash()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        if (user.getStatus() != User.UserStatus.ACTIVE)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Account " + user.getStatus().name().toLowerCase()));
        return ResponseEntity.ok(new AuthResponse(jwt.generate(user), user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
    }
}
