package com.cortador.back.model;

import com.cortador.back.model.enums.SlotCoverage;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.EnumSet;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A qué días se aplica una regla habitual: los días de la semana elegidos
 * y, si las tiene, solo entre sus fechas de inicio y fin (incluidas).
 */
class AvailabilityRuleTest {

    // 2026-11-02 es lunes y 2026-11-07, sábado.
    private static final LocalDate MONDAY = LocalDate.of(2026, 11, 2);
    private static final LocalDate SATURDAY = LocalDate.of(2026, 11, 7);

    private AvailabilityRule weekdays(LocalDate start, LocalDate end) {
        return AvailabilityRule.builder()
                .daysOfWeek(EnumSet.range(DayOfWeek.MONDAY, DayOfWeek.FRIDAY))
                .coverage(SlotCoverage.FULL_DAY)
                .startDate(start)
                .endDate(end)
                .build();
    }

    @Test
    void sinFechas_seAplicaSiempreEnSusDiasDeLaSemana() {
        AvailabilityRule rule = weekdays(null, null);

        assertThat(rule.appliesTo(MONDAY)).isTrue();
        assertThat(rule.appliesTo(MONDAY.plusWeeks(260))).isTrue();
        assertThat(rule.appliesTo(SATURDAY)).isFalse();
    }

    @Test
    void conFechas_soloSeAplicaEntreElInicioYElFinIncluidos() {
        AvailabilityRule rule = weekdays(MONDAY, MONDAY.plusDays(7));

        assertThat(rule.appliesTo(MONDAY)).isTrue();
        assertThat(rule.appliesTo(MONDAY.plusDays(7))).isTrue();
        assertThat(rule.appliesTo(MONDAY.minusDays(7))).isFalse();
        assertThat(rule.appliesTo(MONDAY.plusDays(14))).isFalse();
    }

    @Test
    void conSoloFechaDeInicio_seAplicaDesdeEseDiaEnAdelante() {
        AvailabilityRule rule = weekdays(MONDAY, null);

        assertThat(rule.appliesTo(MONDAY.minusDays(7))).isFalse();
        assertThat(rule.appliesTo(MONDAY.plusWeeks(52))).isTrue();
    }
}
