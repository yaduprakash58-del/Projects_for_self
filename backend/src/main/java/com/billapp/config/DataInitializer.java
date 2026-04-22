package com.billapp.config;

import com.billapp.entity.User;
import com.billapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Optional<User> existing = userRepository.findByUsername("admin");

        if (existing.isEmpty()) {
            // First boot — create admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@billapp.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default admin created: username=admin, password=admin123");

        } else {
            // Admin exists — re-encode password to ensure it is always valid.
            // This fixes cases where the DB was seeded with an incorrect BCrypt hash.
            User admin = existing.get();
            String freshHash = passwordEncoder.encode("admin123");
            admin.setPassword(freshHash);
            userRepository.save(admin);
            System.out.println("✅ Admin password re-synced on startup (username=admin, password=admin123)");
        }
    }
}
