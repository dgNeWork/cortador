package com.cortador.back.model;

import com.cortador.back.model.enums.TimeSlot;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Las reservas antiguas no guardaban la franja: se deduce de la hora.
 * Se prueban los dos lados del corte de las 17:00 y la propia hora límite.
 */
class TimeSlotTest {

    @Test
    void fromEventTime_antesDeLas17_esMananaTarde() {
        assertThat(TimeSlot.fromEventTime(LocalTime.of(13, 0))).isEqualTo(TimeSlot.MIDDAY);
        assertThat(TimeSlot.fromEventTime(LocalTime.of(16, 59))).isEqualTo(TimeSlot.MIDDAY);
    }

    @Test
    void fromEventTime_desdeLas17_esTardeNoche() {
        assertThat(TimeSlot.fromEventTime(LocalTime.of(17, 0))).isEqualTo(TimeSlot.EVENING);
        assertThat(TimeSlot.fromEventTime(LocalTime.of(21, 30))).isEqualTo(TimeSlot.EVENING);
    }

    @Test
    void effectiveTimeSlot_usaLaFranjaGuardadaYSoloSiFaltaLaDeduceDeLaHora() {
        Booking withSlot = Booking.builder().eventTime(LocalTime.of(13, 0)).timeSlot(TimeSlot.EVENING).build();
        Booking withoutSlot = Booking.builder().eventTime(LocalTime.of(21, 0)).build();

        assertThat(withSlot.effectiveTimeSlot()).isEqualTo(TimeSlot.EVENING);
        assertThat(withoutSlot.effectiveTimeSlot()).isEqualTo(TimeSlot.EVENING);
    }
}
