package com.cortador.back.model;

import com.cortador.back.model.enums.SlotCoverage;
import com.cortador.back.model.enums.TimeSlot;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Cuentas de la ocupación de un día: qué franjas cubre cada valor y cómo
 * se suman dos ocupaciones del mismo día.
 */
class SlotCoverageTest {

    @Test
    void covers_cadaValorCubreSusFranjas() {
        assertThat(SlotCoverage.NONE.covers(TimeSlot.MIDDAY)).isFalse();
        assertThat(SlotCoverage.MIDDAY.covers(TimeSlot.MIDDAY)).isTrue();
        assertThat(SlotCoverage.MIDDAY.covers(TimeSlot.EVENING)).isFalse();
        assertThat(SlotCoverage.EVENING.covers(TimeSlot.EVENING)).isTrue();
        assertThat(SlotCoverage.EVENING.covers(TimeSlot.MIDDAY)).isFalse();
        assertThat(SlotCoverage.FULL_DAY.covers(TimeSlot.MIDDAY)).isTrue();
        assertThat(SlotCoverage.FULL_DAY.covers(TimeSlot.EVENING)).isTrue();
    }

    @Test
    void plus_sumaLasFranjasDeLasDosOcupaciones() {
        assertThat(SlotCoverage.MIDDAY.plus(SlotCoverage.EVENING)).isEqualTo(SlotCoverage.FULL_DAY);
        assertThat(SlotCoverage.MIDDAY.plus(SlotCoverage.MIDDAY)).isEqualTo(SlotCoverage.MIDDAY);
        assertThat(SlotCoverage.NONE.plus(SlotCoverage.EVENING)).isEqualTo(SlotCoverage.EVENING);
        assertThat(SlotCoverage.NONE.plus(SlotCoverage.NONE)).isEqualTo(SlotCoverage.NONE);
        assertThat(SlotCoverage.FULL_DAY.plus(SlotCoverage.NONE)).isEqualTo(SlotCoverage.FULL_DAY);
    }

    @Test
    void of_convierteUnaFranjaEnSuOcupacion() {
        assertThat(SlotCoverage.of(TimeSlot.MIDDAY)).isEqualTo(SlotCoverage.MIDDAY);
        assertThat(SlotCoverage.of(TimeSlot.EVENING)).isEqualTo(SlotCoverage.EVENING);
    }
}
