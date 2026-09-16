package com.cortador.back.config;

import com.cortador.back.model.User;
import com.cortador.back.model.enums.Role;
import com.cortador.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea la cuenta de admin la primera vez que arranca la aplicación, si
 * todavía no existe. No hay pantalla de registro (es un solo cortador,
 * no un marketplace), así que la única forma de tener un admin es esta:
 * arrancar una vez con ADMIN_EMAIL/ADMIN_PASSWORD ya puestos.
 * Es idempotente: si el usuario ya existe, no hace nada.
 */
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
    }
}
