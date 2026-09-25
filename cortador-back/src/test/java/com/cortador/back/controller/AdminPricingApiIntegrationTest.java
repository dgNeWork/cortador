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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test de integración de la pestaña "Tarifas" del panel: tarifas y
 * localidades con la aplicación completa. Igual que el del catálogo,
 * @Transactional deshace al final todo lo que se escribe.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminPricingApiIntegrationTest {

    private static final String PRICING_URL = "/api/admin/pricing";
    private static final String LOCALITIES_URL = "/api/admin/localities";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email}")
    private String adminEmail;

    private String authHeader;

    @BeforeEach
    void setUp() {
        authHeader = "Bearer " + jwtService.generateToken(userRepository.findByEmail(adminEmail).orElseThrow());
    }

    @Test
    void sinToken_noSePuedenVerNiCambiarLasTarifas() throws Exception {
        mockMvc.perform(get(PRICING_URL)).andExpect(status().isUnauthorized());
        mockMvc.perform(get(LOCALITIES_URL)).andExpect(status().isUnauthorized());
    }

    @Test
    void guardarTarifas_devuelveLosValoresGuardados() throws Exception {
        mockMvc.perform(put(PRICING_URL)
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hourlyRate\":65.5,\"pricePerKm\":0.3,\"homeLocality\":\"Localidad de prueba\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hourlyRate").value(65.5))
                .andExpect(jsonPath("$.homeLocality").value("Localidad de prueba"));
    }

    @Test
    void crearYBorrarUnaLocalidad() throws Exception {
        String created = mockMvc.perform(post(LOCALITIES_URL)
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Pueblo de prueba\",\"distanceKm\":33}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.distanceKm").value(33))
                .andReturn().getResponse().getContentAsString();
        // Sacamos el id de la respuesta para poder borrarla después.
        String id = created.replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(delete(LOCALITIES_URL + "/" + id).header("Authorization", authHeader))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(LOCALITIES_URL).header("Authorization", authHeader))
                .andExpect(jsonPath("$[*].name", not(hasItem("Pueblo de prueba"))));
    }

    @Test
    void unaLocalidadRepetida_devuelve400ConUnMensajeClaro() throws Exception {
        String body = "{\"name\":\"Pueblo repetido\",\"distanceKm\":20}";
        mockMvc.perform(post(LOCALITIES_URL).header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post(LOCALITIES_URL).header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON).content(body.replace("Pueblo", "pueblo")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya tienes pueblo repetido en la lista"));
    }

    @Test
    void kmNegativos_devuelve400ConElErrorDelCampo() throws Exception {
        mockMvc.perform(post(LOCALITIES_URL).header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Pueblo\",\"distanceKm\":-4}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.distanceKm").value("Los kilómetros deben ser mayores que cero"));
    }
}
