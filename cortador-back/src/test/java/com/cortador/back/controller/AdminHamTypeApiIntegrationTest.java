package com.cortador.back.controller;

import com.cortador.back.repository.UserRepository;
import com.cortador.back.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test de integración de la API del catálogo: arranca la aplicación
 * completa (seguridad, controladores, servicios y base de datos reales)
 * y le hace peticiones con MockMvc, que simula el servidor HTTP sin abrir
 * un puerto de verdad.
 *
 * @Transactional hace que, al terminar cada test, se deshaga todo lo que
 * haya escrito en la base de datos (rollback): los jamones que se crean
 * aquí no se quedan en la base de datos de desarrollo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminHamTypeApiIntegrationTest {

    private static final String ADMIN_URL = "/api/admin/ham-types";
    private static final String PUBLIC_URL = "/api/ham-types";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email}")
    private String adminEmail;

    private String authHeader;

    // Generamos un token válido del admin que crea AdminUserInitializer al
    // arrancar, igual que haría el login, para no depender de su contraseña.
    @BeforeEach
    void setUp() {
        String token = jwtService.generateToken(userRepository.findByEmail(adminEmail).orElseThrow());
        authHeader = "Bearer " + token;
    }

    @Test
    void sinToken_elCatalogoDelPanelDevuelve401() throws Exception {
        mockMvc.perform(get(ADMIN_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sinToken_noSePuedeCrearUnJamon() throws Exception {
        mockMvc.perform(post(ADMIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Pirata\",\"price\":1}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unJamonCreadoDesactivado_saleEnElPanelPeroNoEnElFormularioPublico() throws Exception {
        mockMvc.perform(post(ADMIN_URL)
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Jamón de prueba retirado\",\"price\":99.50,\"active\":false}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(false));

        // "$[*].name" = la lista de nombres de todos los jamones devueltos.
        mockMvc.perform(get(ADMIN_URL).header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("Jamón de prueba retirado")));

        mockMvc.perform(get(PUBLIC_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", not(hasItem("Jamón de prueba retirado"))));
    }

    @Test
    void conDatosInvalidos_devuelve400ConElErrorDeCadaCampo() throws Exception {
        mockMvc.perform(post(ADMIN_URL)
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"price\":-5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("El nombre es obligatorio"))
                .andExpect(jsonPath("$.fieldErrors.price").value("El precio debe ser mayor que cero"));
    }
}
