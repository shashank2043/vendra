package com.pinnacle.vendra.auth.config;

import com.pinnacle.vendra.auth.entity.Role;
import com.pinnacle.vendra.auth.entity.User;
import com.pinnacle.vendra.auth.repository.RoleRepository;
import com.pinnacle.vendra.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking database initialization...");

        // Ensure roles exist
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CUSTOMER").build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));
        Role vendorRole = roleRepository.findByName("ROLE_VENDOR")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_VENDOR").build()));

        // Ensure admin user exists
        if (!userRepository.existsByUsername("admin")) {
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(customerRole);
            adminRoles.add(adminRole);

            User admin = User.builder()
                    .username("admin")
                    .email("admin@vendra.com")
                    .password(passwordEncoder.encode("password123"))
                    .roles(adminRoles)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded default 'admin' user");
        }

        // Ensure user user exists
        if (!userRepository.existsByUsername("user")) {
            Set<Role> standardRoles = new HashSet<>();
            standardRoles.add(customerRole);

            User user = User.builder()
                    .username("user")
                    .email("user@vendra.com")
                    .password(passwordEncoder.encode("password123"))
                    .roles(standardRoles)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded default 'user' user");
        }

        // Ensure vendor user exists
        if (!userRepository.existsByUsername("vendor")) {
            Set<Role> vendorRoles = new HashSet<>();
            vendorRoles.add(vendorRole);

            User vendor = User.builder()
                    .username("vendor")
                    .email("vendor@vendra.com")
                    .password(passwordEncoder.encode("password123"))
                    .roles(vendorRoles)
                    .enabled(true)
                    .build();
            userRepository.save(vendor);
            log.info("Seeded default 'vendor' user");
        }
    }
}
