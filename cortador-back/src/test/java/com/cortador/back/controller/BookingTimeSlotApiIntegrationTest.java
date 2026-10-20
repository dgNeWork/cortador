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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Franjas con la aplicación real: una reserva confirmada ocupa su franja
 * (no se puede pedir ni confirmar otra encima), pero deja libre la otra
 * franja del mismo día, y las pendientes no bloquean nada.
 *
 * Se usa una fecha lejana propia del test para no chocar con reservas de
 * la base de datos de desarrollo. @Transactional lo deshace todo al final.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingTimeSlotApiIntegrationTest {

    private static final LocalDate DATE = LocalDate.now().plusYears(3);

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

    // Envía una solicitud para DATE en la franja indicada (null = sin franja).
    private ResultActions requestBooking(String timeSlot) throws Exception {
        String slotField = timeSlot != null ? "\"timeSlot\":\"" + timeSlot + "\"," : "";
        String json = """
                {"customerName":"Cliente de prueba","customerEmail":"franjas.prueba@example.com",
                 "customerPhone":"600000000","eventDate":"%s","eventTime":"13:00",%s
                 "estimatedDurationHours":3,"eventType":"WEDDING","guestCount":80,
                 "location":"Finca de prueba","serviceType":"CUT_ONLY",
                 "localityOption":"LISTED","localityId":%d}
                """.formatted(DATE, slotField, testLocalityId);
        return mockMvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private long idOf(ResultActions result) throws Exception {
        String body = result.andReturn().getResponse().getContentAsString();
        return Long.parseLong(body.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    private ResultActions confirm(long id) throws Exception {
        return mockMvc.perform(patch("/api/bookings/" + id + "/status")
                .header("Authorization", adminAuthHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"CONFIRMED\"}"));
    }

    @Test
    void sinFranja_laSolicitudSeRechazaConElCampoMarcado() throws Exception {
        requestBooking(null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.timeSlot").value("Elige la franja del evento"));
    }

    @Test
    void laFranjaSeGuardaYSeDevuelve() throws Exception {
        requestBooking("EVENING")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.timeSlot").value("EVENING"));
    }

    @Test
    void unaReservaConfirmadaOcupaSuFranja_peroNoLaOtraNiLasPendientesBloquean() throws Exception {
        // Dos solicitudes pendientes para la misma franja: las dos se aceptan.
        long first = idOf(requestBooking("MIDDAY").andExpect(status().isCreated()));
        long second = idOf(requestBooking("MIDDAY").andExpect(status().isCreated()));

        // El cortador confirma la primera: la franja queda ocupada.
        confirm(first).andExpect(status().isOk());

        // Ya no se puede pedir esa franja...
        requestBooking("MIDDAY")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Esa franja ya no está disponible ese día. Elige otro día u otra franja."));
        // ...pero la otra franja del mismo día sigue libre.
        requestBooking("EVENING").andExpect(status().isCreated());

        // Y la segunda pendiente no se puede confirmar encima de la primera.
        confirm(second)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Ya tienes otra reserva confirmada ese día por la mañana/tarde. Cancélala antes de confirmar esta."));
    }
}
