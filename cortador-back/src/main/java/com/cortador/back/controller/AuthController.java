package com.cortador.back.controller;

import com.cortador.back.dto.request.LoginRequest;
import com.cortador.back.dto.response.LoginResponse;
import com.cortador.back.exception.InvalidCredentialsException;
import com.cortador.back.model.User;
import com.cortador.back.repository.UserRepository;
import com.cortador.back.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Login del admin: único endpoint público de este controlador. A cambio
 * de un email y contraseña correctos, devuelve un token JWT que hay que
 * mandar en la cabecera Authorization de las peticiones al panel de admin.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Email o contraseña incorrectos");
        }

        // Si la autenticación no ha fallado, el usuario existe seguro.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email o contraseña incorrectos"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(LoginResponse.builder().token(token).email(user.getEmail()).build());
    }
}
