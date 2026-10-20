package com.cortador.back.controller;

import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.AvailabilityRuleRepository;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Calendario con la aplicación real: lo que ve el cliente, lo que ve el
 * cortador, las marcas de días, las reglas habituales y que no se pueda
 * pedir una franja que el cortador ha bloqueado.
 *
 * Se usan fechas lejanas propias del test, y se borran las reglas que
 * hubiera, para no depender de la base de datos de desarrollo.
 * @Transactional lo deshace todo al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AvailabilityApiIntegrationTest {

    // Un lunes lejano y el sábado de esa misma semana.
    private static final LocalDate MONDAY = LocalDate.now().plusYears(4).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    private static final LocalDate SATURDAY = MONDAY.plusDays(5);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AvailabilityRuleRepository availabilityRuleRepository;

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
        availabilityRuleRepository.deleteAll();

        PricingSettings settings = pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)
                .orElseGet(PricingSettings::new);
        settings.setHourlyRate(new BigDecimal("50.00"));
        settings.setPricePerKm(new BigDecimal("0.40"));
        settings.setHomeLocality("Casa de prueba");
        pricingSettingsRepository.save(settings);
        testLocalityId = localityRepository.save(
                Locality.builder().name("Pueblo de prueba").distanceKm(70).build()).getId();
    }

    private String auth() {
        return "Bearer " + jwtService.generateToken(userRepository.findByEmail(adminEmail).orElseThrow());
    }

    private ResultActions publicWeek() throws Exception {
        return mockMvc.perform(get("/api/availability").param("from", MONDAY.toString()).param("to", SATURDAY.toString()));
    }

    private void mark(LocalDate date, String coverage) throws Exception {
        mockMvc.perform(put("/api/admin/day-marks/" + date).header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"coverage\":\"" + coverage + "\"}"))
                .andExpect(status().isNoContent());
    }

    private ResultActions requestBooking(LocalDate date, String slot) throws Exception {
        String json = """
                {"customerName":"Cliente de prueba","customerEmail":"calendario.prueba@example.com",
                 "customerPhone":"600000000","eventDate":"%s","eventTime":"13:00","timeSlot":"%s",
                 "estimatedDurationHours":3,"eventType":"WEDDING","guestCount":80,
                 "location":"Finca de prueba","serviceType":"CUT_ONLY",
                 "localityOption":"LISTED","localityId":%d}
                """.formatted(date, slot, testLocalityId);
        return mockMvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void elCalendarioPublicoNoNecesitaLogin_yUnaSemanaSinNadaSaleVacia() throws Exception {
        publicWeek().andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void lasRutasDelCalendarioDelPanelPidenLogin() throws Exception {
        mockMvc.perform(get("/api/admin/availability").param("from", MONDAY.toString()).param("to", SATURDAY.toString()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/admin/day-marks/" + MONDAY)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"coverage\":\"FULL_DAY\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unaMarcaSeVeEnLosDosCalendarios_peroElClienteSoloVeQueEstaOcupado() throws Exception {
        mark(SATURDAY, "EVENING");

        publicWeek()
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].date").value(SATURDAY.toString()))
                .andExpect(jsonPath("$[0].occupied").value("EVENING"))
                // El cliente no ve el porqué.
                .andExpect(jsonPath("$[0].mark").doesNotExist());

        mockMvc.perform(get("/api/admin/availability").header("Authorization", auth())
                        .param("from", MONDAY.toString()).param("to", SATURDAY.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].mark").value("EVENING"))
                .andExpect(jsonPath("$[0].booked").value("NONE"));

        // Quitar la marca deja el día libre otra vez.
        mockMvc.perform(delete("/api/admin/day-marks/" + SATURDAY).header("Authorization", auth()))
                .andExpect(status().isNoContent());
        publicWeek().andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void unaReglaDeLunesAViernesOcupaEsosDias_yUnaMarcaLibreHaceDeExcepcion() throws Exception {
        String rule = mockMvc.perform(post("/api/admin/availability-rules").header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"daysOfWeek\":[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"],"
                                + "\"coverage\":\"FULL_DAY\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.daysOfWeek[0]").value("MONDAY"))
                .andReturn().getResponse().getContentAsString();
        long ruleId = Long.parseLong(rule.replaceAll(".*\"id\":(\\d+).*", "$1"));

        // De lunes a viernes ocupados; el sábado, libre.
        publicWeek().andExpect(jsonPath("$", hasSize(5)));

        // El martes, por excepción, puede trabajar.
        mark(MONDAY.plusDays(1), "NONE");
        publicWeek().andExpect(jsonPath("$", hasSize(4)));

        // Borrar la regla libera el resto.
        mockMvc.perform(delete("/api/admin/availability-rules/" + ruleId).header("Authorization", auth()))
                .andExpect(status().isNoContent());
        publicWeek().andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void unaReglaMalHecha_seRechazaConMensajesClaros() throws Exception {
        mockMvc.perform(post("/api/admin/availability-rules").header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"daysOfWeek\":[],\"coverage\":\"FULL_DAY\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.daysOfWeek").value("Elige al menos un día de la semana"));

        mockMvc.perform(post("/api/admin/availability-rules").header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"daysOfWeek\":[\"MONDAY\"],\"coverage\":\"NONE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Una regla tiene que ocupar al menos una franja"));
    }

    @Test
    void noSePuedePedirUnaFranjaBloqueadaPorElCortador_peroSiLaOtra() throws Exception {
        mark(SATURDAY, "MIDDAY");

        requestBooking(SATURDAY, "MIDDAY").andExpect(status().isConflict());
        requestBooking(SATURDAY, "EVENING").andExpect(status().isCreated());
    }

    @Test
    void sinFechasOConFechasMalEscritas_devuelve400EnEspanol() throws Exception {
        mockMvc.perform(get("/api/availability").param("from", MONDAY.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Falta el parámetro to"));
        mockMvc.perform(get("/api/availability").param("from", "mañana").param("to", SATURDAY.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El valor de from no es válido"));
        mockMvc.perform(get("/api/availability").param("from", SATURDAY.toString()).param("to", MONDAY.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La fecha final no puede ser anterior a la inicial"));
    }
}
