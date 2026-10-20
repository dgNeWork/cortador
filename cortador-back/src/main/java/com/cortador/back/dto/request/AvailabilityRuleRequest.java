package com.cortador.back.dto.request;

import com.cortador.back.model.enums.SlotCoverage;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

/**
 * Regla habitual que crea o edita el cortador en su calendario. Que la
 * ocupación no sea NONE y que las fechas no vayan al revés se comprueba
 * en AvailabilityRuleService.
 */
@Getter
@Setter
public class AvailabilityRuleRequest {

    @NotEmpty(message = "Elige al menos un día de la semana")
    private Set<DayOfWeek> daysOfWeek;

    @NotNull(message = "Elige qué parte del día está ocupada")
    private SlotCoverage coverage;

    // Opcionales: sin ellas, la regla vale para siempre.
    private LocalDate startDate;

    private LocalDate endDate;
}
