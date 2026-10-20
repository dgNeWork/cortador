package com.cortador.back.availability;

import com.cortador.back.dto.request.AvailabilityRuleRequest;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.AvailabilityRule;
import com.cortador.back.model.enums.SlotCoverage;
import com.cortador.back.repository.AvailabilityRuleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Reglas habituales: lo que se comprueba al crearlas o editarlas.
 */
@ExtendWith(MockitoExtension.class)
class AvailabilityRuleServiceTest {

    @Mock
    private AvailabilityRuleRepository availabilityRuleRepository;

    @InjectMocks
    private AvailabilityRuleService availabilityRuleService;

    private AvailabilityRuleRequest request(SlotCoverage coverage, LocalDate start, LocalDate end) {
        AvailabilityRuleRequest request = new AvailabilityRuleRequest();
        request.setDaysOfWeek(Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY));
        request.setCoverage(coverage);
        request.setStartDate(start);
        request.setEndDate(end);
        return request;
    }

    @Test
    void create_guardaLosDiasLaOcupacionYLasFechas() {
        when(availabilityRuleRepository.save(any(AvailabilityRule.class))).thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate start = LocalDate.of(2026, 11, 1);
        LocalDate end = LocalDate.of(2027, 6, 30);

        AvailabilityRule rule = availabilityRuleService.create(request(SlotCoverage.FULL_DAY, start, end));

        assertThat(rule.getDaysOfWeek()).containsExactlyInAnyOrder(DayOfWeek.MONDAY, DayOfWeek.TUESDAY);
        assertThat(rule.getCoverage()).isEqualTo(SlotCoverage.FULL_DAY);
        assertThat(rule.getStartDate()).isEqualTo(start);
        assertThat(rule.getEndDate()).isEqualTo(end);
    }

    @Test
    void create_unaReglaQueNoOcupaNada_seRechaza() {
        AvailabilityRuleRequest request = request(SlotCoverage.NONE, null, null);

        assertThatThrownBy(() -> availabilityRuleService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Una regla tiene que ocupar al menos una franja");
        verify(availabilityRuleRepository, never()).save(any());
    }

    @Test
    void create_conLaFechaFinalAntesQueLaInicial_seRechaza() {
        AvailabilityRuleRequest request = request(SlotCoverage.MIDDAY, LocalDate.of(2027, 1, 10), LocalDate.of(2027, 1, 1));

        assertThatThrownBy(() -> availabilityRuleService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La fecha final no puede ser anterior a la inicial");
    }

    @Test
    void update_cambiaLaReglaExistente() {
        AvailabilityRule existing = AvailabilityRule.builder().id(5L).coverage(SlotCoverage.MIDDAY).build();
        when(availabilityRuleRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(availabilityRuleRepository.save(any(AvailabilityRule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AvailabilityRule updated = availabilityRuleService.update(5L, request(SlotCoverage.EVENING, null, null));

        assertThat(updated.getId()).isEqualTo(5L);
        assertThat(updated.getCoverage()).isEqualTo(SlotCoverage.EVENING);
    }

    @Test
    void update_yDelete_deUnaReglaQueNoExiste_lanzanResourceNotFoundException() {
        when(availabilityRuleRepository.findById(99L)).thenReturn(Optional.empty());
        AvailabilityRuleRequest request = request(SlotCoverage.EVENING, null, null);

        assertThatThrownBy(() -> availabilityRuleService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> availabilityRuleService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
