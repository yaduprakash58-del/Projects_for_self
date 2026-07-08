package com.billapp.config;

import com.billapp.entity.User;
import com.billapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Initial password for the seeded admin. Override per-deployment via the
    // APP_ADMIN_PASSWORD env var; falls back to admin123 for local dev.
    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Only seed on a fresh database. If the admin already exists, leave its
        // password untouched so it can be changed and the change persists across
        // restarts (previously this reset the password on every boot).
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@billapp.com")
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default admin created (username=admin)");
        }
    }
}
