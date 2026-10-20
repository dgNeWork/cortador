package com.cortador.back.controller;

import com.cortador.back.model.User;
import com.cortador.back.model.enums.Role;
import com.cortador.back.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Login del cortador con la aplicación real (Spring Security, BCrypt y JWT
 * de verdad). Es la puerta de entrada al panel, así que se prueban tanto
 * el camino bueno como los distintos fallos.
 *
 * Se crea un usuario propio en cada test (no se usa el admin de desarrollo),
 * así el resultado no depende de la contraseña que tenga cada máquina.
 * @Transactional lo deshace todo al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiIntegrationTest {

    private static final String EMAIL = "login.prueba@example.com";
    private static final String PASSWORD = "clave-de-prueba-123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // La contraseña se guarda cifrada con BCrypt, igual que la del admin real.
        userRepository.save(User.builder()
                .email(EMAIL)
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ADMIN)
                .build());
    }

    private String loginJson(String email, String password) {
        return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
    }

    @Test
    void conEmailYContrasenaCorrectos_devuelveUnTokenQueAbreElPanel() throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(EMAIL, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.token").value(not(emptyString())))
                .andReturn().getResponse().getContentAsString();

        // El token recibido sirve de verdad para entrar en un endpoint protegido.
        String token = body.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
        mockMvc.perform(get("/api/bookings").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void conContrasenaIncorrecta_devuelve401ConMensajeEnEspanol() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(EMAIL, "contraseña-mala")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email o contraseña incorrectos"));
    }

    @Test
    void conUnEmailQueNoExiste_devuelveElMismo401() throws Exception {
        // Mismo mensaje que con la contraseña mala: así no se puede averiguar
        // qué emails tienen cuenta probando en el login.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("nadie@example.com", PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email o contraseña incorrectos"));
    }

    @Test
    void conCamposVacios_devuelve400YMarcaCadaCampo() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").value("El email es obligatorio"))
                .andExpect(jsonPath("$.fieldErrors.password").value("La contraseña es obligatoria"));
    }

    @Test
    void sinToken_unEndpointDelPanelDevuelve401() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Es necesario iniciar sesión para acceder a este recurso"));
    }
}
