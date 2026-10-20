package com.cortador.back.availability;

import com.cortador.back.model.Booking;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.TimeSlot;
import com.cortador.back.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Reglas de ocupación de una franja. El repositorio es un mock que
 * devuelve las reservas confirmadas de ese día que preparamos en cada test.
 */
@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    private static final LocalDate DATE = LocalDate.of(2026, 12, 12);

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private Booking confirmed(long id, TimeSlot slot) {
        return Booking.builder().id(id).eventDate(DATE).eventTime(LocalTime.of(13, 0))
                .timeSlot(slot).status(BookingStatus.CONFIRMED).build();
    }

    @Test
    void unaReservaConfirmadaOcupaSuFranjaPeroNoLaOtra() {
        when(bookingRepository.findByEventDateAndStatus(DATE, BookingStatus.CONFIRMED))
                .thenReturn(List.of(confirmed(1L, TimeSlot.MIDDAY)));

        assertThat(availabilityService.isTakenByConfirmedBooking(DATE, TimeSlot.MIDDAY, null)).isTrue();
        assertThat(availabilityService.isTakenByConfirmedBooking(DATE, TimeSlot.EVENING, null)).isFalse();
    }

    @Test
    void laReservaExcluidaNoCuenta_paraQueUnaReservaNoChoqueConsigoMisma() {
        when(bookingRepository.findByEventDateAndStatus(DATE, BookingStatus.CONFIRMED))
                .thenReturn(List.of(confirmed(1L, TimeSlot.MIDDAY)));

        assertThat(availabilityService.isTakenByConfirmedBooking(DATE, TimeSlot.MIDDAY, 1L)).isFalse();
    }

    @Test
    void sinReservasConfirmadasEseDia_todoEstaLibre() {
        when(bookingRepository.findByEventDateAndStatus(DATE, BookingStatus.CONFIRMED)).thenReturn(List.of());

        assertThat(availabilityService.isTakenByConfirmedBooking(DATE, TimeSlot.MIDDAY, null)).isFalse();
    }
}
