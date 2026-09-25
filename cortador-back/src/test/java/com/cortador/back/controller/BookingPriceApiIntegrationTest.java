package com.cortador.back.controller;

import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Flujo completo del precio con la aplicación real: el cliente pide
 * presupuesto, reserva (y se guarda el desglose) y el cortador ajusta el
 * precio desde el panel.
 *
 * Las tarifas y la localidad se preparan en cada test (no se usan las de
 * muestra), así el resultado no depende de lo que haya en la base de datos
 * de desarrollo. @Transactional lo deshace todo al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingPriceApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PricingSettingsRepository pricingSettingsRepository;

    @Autowired
    private LocalityRepository localityRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email}")
    private String adminEmail;

    private Long testLocalityId;

    @BeforeEach
    void setUp() {
        // 50 €/hora y 0,40 €/km, y una localidad de prueba a 70 km.
        PricingSettings settings = pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)
                .orElseGet(PricingSettings::new);
        settings.setHourlyRate(new BigDecimal("50.00"));
        settings.setPricePerKm(new BigDecimal("0.40"));
        settings.setHomeLocality("Casa de prueba");
        pricingSettingsRepository.save(settings);

        testLocalityId = localityRepository.save(
                Locality.builder().name("Pueblo de prueba").distanceKm(70).build()).getId();
    }

    private String adminAuthHeader() {
        return "Bearer " + jwtService.generateToken(userRepository.findByEmail(adminEmail).orElseThrow());
    }

    private String bookingJson() {
        return """
                {"customerName":"Cliente de prueba","customerEmail":"prueba@example.com",
                 "customerPhone":"600000000","eventDate":"%s","eventTime":"13:00",
                 "estimatedDurationHours":3,"eventType":"WEDDING","guestCount":80,
                 "location":"Finca de prueba","serviceType":"CUT_ONLY",
                 "localityOption":"LISTED","localityId":%d}
                """.formatted(LocalDate.now().plusDays(30), testLocalityId);
    }

    @Test
    void elFormularioPuedeVerLasLocalidadesSinLogin() throws Exception {
        mockMvc.perform(get("/api/localities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.homeLocality").value("Casa de prueba"))
                .andExpect(jsonPath("$.localities[*].name", hasItem("Pueblo de prueba")));
    }

    @Test
    void elPresupuestoEsPublicoYSaleDesglosado() throws Exception {
        // 3 h x 50 € = 150 €  +  70 km x 0,40 € = 28 €  =  178 €
        mockMvc.perform(post("/api/bookings/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estimatedDurationHours\":3,\"serviceType\":\"CUT_ONLY\","
                                + "\"localityOption\":\"LISTED\",\"localityId\":" + testLocalityId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceCost").value(150.0))
                .andExpect(jsonPath("$.travelCost").value(28.0))
                .andExpect(jsonPath("$.total").value(178.0))
                .andExpect(jsonPath("$.onRequest").value(false));
    }

    @Test
    void alReservar_seGuardaElDesgloseYElCortadorPuedeAjustarElPrecio() throws Exception {
        String created = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.localityName").value("Pueblo de prueba"))
                .andExpect(jsonPath("$.estimatedPrice").value(178.0))
                .andReturn().getResponse().getContentAsString();
        String id = created.replaceAll("^\\{\"id\":(\\d+).*", "$1");

        // Sin login no se puede tocar el precio...
        mockMvc.perform(patch("/api/bookings/" + id + "/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"finalPrice\":1,\"note\":\"Intento sin login\"}"))
                .andExpect(status().isUnauthorized());

        // ...y el cortador sí, dejando el calculado como estaba.
        mockMvc.perform(patch("/api/bookings/" + id + "/price")
                        .header("Authorization", adminAuthHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"finalPrice\":160,\"note\":\"Descuento por cliente habitual\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalPrice").value(160.0))
                .andExpect(jsonPath("$.priceNote").value("Descuento por cliente habitual"))
                .andExpect(jsonPath("$.estimatedPrice").value(178.0));
    }

    @Test
    void ajustarElPrecioSinMotivo_devuelve400() throws Exception {
        String created = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson()))
                .andReturn().getResponse().getContentAsString();
        String id = created.replaceAll("^\\{\"id\":(\\d+).*", "$1");

        mockMvc.perform(patch("/api/bookings/" + id + "/price")
                        .header("Authorization", adminAuthHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"finalPrice\":160,\"note\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.note").value("Escribe el motivo del cambio de precio"));
    }
}
