package com.cortador.back.dto.response;

import com.cortador.back.model.AvailabilityRule;
import com.cortador.back.model.enums.SlotCoverage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Regla habitual tal y como la ve el panel. Los días van ordenados de
 * lunes a domingo para mostrarlos siempre igual.
 */
@Getter
@Builder
@AllArgsConstructor
public class AvailabilityRuleResponse {
    private Long id;
    private List<DayOfWeek> daysOfWeek;
    private SlotCoverage coverage;
    private LocalDate startDate;
    private LocalDate endDate;

    public static AvailabilityRuleResponse from(AvailabilityRule rule) {
        return AvailabilityRuleResponse.builder()
                .id(rule.getId())
                .daysOfWeek(rule.getDaysOfWeek().stream().sorted().toList())
                .coverage(rule.getCoverage())
                .startDate(rule.getStartDate())
                .endDate(rule.getEndDate())
                .build();
    }
}
