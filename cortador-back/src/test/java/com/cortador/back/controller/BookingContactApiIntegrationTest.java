package com.cortador.back.controller;

import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.CustomerRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Un mismo cliente (mismo email) hace dos solicitudes con datos distintos,
 * como un wedding planner que pide varias bodas o alguien que corrige su
 * teléfono. Se comprueba con la aplicación real que:
 * - no se duplica el cliente aunque escriba el email con mayúsculas;
 * - cada reserva muestra en el panel el nombre y teléfono de SU solicitud.
 *
 * @Transactional lo deshace todo al terminar, así no ensucia la base de
 * datos de desarrollo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingContactApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PricingSettingsRepository pricingSettingsRepository;

    @Autowired
    private LocalityRepository localityRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.email}")
    private String adminEmail;

    private Long testLocalityId;

    @BeforeEach
    void setUp() {
        // Tarifas y localidad propias del test, para no depender de los
        // datos de muestra de la base de datos de desarrollo.
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

    private String bookingJson(String name, String email, String phone) {
        return """
                {"customerName":"%s","customerEmail":"%s",
                 "customerPhone":"%s","eventDate":"%s","eventTime":"13:00","timeSlot":"MIDDAY",
                 "estimatedDurationHours":3,"eventType":"WEDDING","guestCount":80,
                 "location":"Finca de prueba","serviceType":"CUT_ONLY",
                 "localityOption":"LISTED","localityId":%d}
                """.formatted(name, email, phone, LocalDate.now().plusDays(30), testLocalityId);
    }

    // Crea la reserva y devuelve su id.
    private long createBooking(String name, String email, String phone) throws Exception {
        String body = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson(name, email, phone)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return Long.parseLong(body.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    @Test
    void dosSolicitudesConElMismoEmail_unSoloClienteYCadaReservaConSuContacto() throws Exception {
        long first = createBooking("Organiza Bodas", "planner.prueba@example.com", "600000001");
        long second = createBooking("Organiza Bodas (boda de Marta)", "Planner.Prueba@Example.com", "600000002");

        // Un solo cliente, guardado con el email en minúsculas y con los
        // últimos datos que escribió.
        assertThat(customerRepository.findByEmail("planner.prueba@example.com"))
                .get()
                .satisfies(customer -> assertThat(customer.getPhone()).isEqualTo("600000002"));

        // En el panel, cada reserva conserva el nombre y teléfono de su solicitud.
        mockMvc.perform(get("/api/bookings/" + first).header("Authorization", adminAuthHeader()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Organiza Bodas"))
                .andExpect(jsonPath("$.customerPhone").value("600000001"))
                .andExpect(jsonPath("$.customerEmail").value("planner.prueba@example.com"));

        mockMvc.perform(get("/api/bookings/" + second).header("Authorization", adminAuthHeader()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Organiza Bodas (boda de Marta)"))
                .andExpect(jsonPath("$.customerPhone").value("600000002"))
                .andExpect(jsonPath("$.customerEmail").value("planner.prueba@example.com"));
    }
}
