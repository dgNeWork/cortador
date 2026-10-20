package com.cortador.back.availability;

import com.cortador.back.model.AvailabilityRule;
import com.cortador.back.model.Booking;
import com.cortador.back.model.DayMark;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.SlotCoverage;
import com.cortador.back.model.enums.TimeSlot;
import com.cortador.back.repository.AvailabilityRuleRepository;
import com.cortador.back.repository.BookingRepository;
import com.cortador.back.repository.DayMarkRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Reglas del calendario: cómo se combinan las reservas confirmadas, las
 * marcas de días concretos y las reglas habituales. Los repositorios son
 * mocks que devuelven lo que preparamos en cada test.
 */
@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    // 2026-12-12 es sábado; 2026-12-14, lunes.
    private static final LocalDate SATURDAY = LocalDate.of(2026, 12, 12);
    private static final LocalDate MONDAY = LocalDate.of(2026, 12, 14);

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private DayMarkRepository dayMarkRepository;

    @Mock
    private AvailabilityRuleRepository availabilityRuleRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private Booking confirmed(long id, LocalDate date, TimeSlot slot) {
        return Booking.builder().id(id).eventDate(date).eventTime(LocalTime.of(13, 0))
                .timeSlot(slot).status(BookingStatus.CONFIRMED).build();
    }

    private AvailabilityRule weekdaysFullDay() {
        return AvailabilityRule.builder()
                .daysOfWeek(EnumSet.range(DayOfWeek.MONDAY, DayOfWeek.FRIDAY))
                .coverage(SlotCoverage.FULL_DAY)
                .build();
    }

    // Prepara los tres repositorios para el periodo [from, to].
    private void given(LocalDate from, LocalDate to, List<Booking> bookings, List<DayMark> marks, List<AvailabilityRule> rules) {
        when(bookingRepository.findByEventDateBetweenAndStatus(from, to, BookingStatus.CONFIRMED)).thenReturn(bookings);
        when(dayMarkRepository.findByDateBetween(from, to)).thenReturn(marks);
        when(availabilityRuleRepository.findAll()).thenReturn(rules);
    }

    // ---- Reservas confirmadas (lo que usa el panel al confirmar) ----

    @Test
    void unaReservaConfirmadaOcupaSuFranjaPeroNoLaOtra() {
        when(bookingRepository.findByEventDateAndStatus(SATURDAY, BookingStatus.CONFIRMED))
                .thenReturn(List.of(confirmed(1L, SATURDAY, TimeSlot.MIDDAY)));

        assertThat(availabilityService.isTakenByConfirmedBooking(SATURDAY, TimeSlot.MIDDAY, null)).isTrue();
        assertThat(availabilityService.isTakenByConfirmedBooking(SATURDAY, TimeSlot.EVENING, null)).isFalse();
    }

    @Test
    void laReservaExcluidaNoCuenta_paraQueUnaReservaNoChoqueConsigoMisma() {
        when(bookingRepository.findByEventDateAndStatus(SATURDAY, BookingStatus.CONFIRMED))
                .thenReturn(List.of(confirmed(1L, SATURDAY, TimeSlot.MIDDAY)));

        assertThat(availabilityService.isTakenByConfirmedBooking(SATURDAY, TimeSlot.MIDDAY, 1L)).isFalse();
    }

    // ---- Estado de los días ----

    @Test
    void getRange_soloDevuelveLosDiasConAlgo_yJuntaReservasYMarcas() {
        LocalDate sunday = SATURDAY.plusDays(1);
        given(SATURDAY, MONDAY,
                List.of(confirmed(1L, SATURDAY, TimeSlot.MIDDAY)),
                List.of(DayMark.builder().date(SATURDAY).coverage(SlotCoverage.EVENING).build()),
                List.of());

        List<DayAvailability> days = availabilityService.getRange(SATURDAY, MONDAY);

        // El domingo y el lunes están libres: no salen.
        assertThat(days).extracting(DayAvailability::date).containsExactly(SATURDAY);
        assertThat(days).extracting(DayAvailability::date).doesNotContain(sunday);
        DayAvailability saturday = days.get(0);
        assertThat(saturday.booked()).isEqualTo(SlotCoverage.MIDDAY);
        assertThat(saturday.mark()).isEqualTo(SlotCoverage.EVENING);
        assertThat(saturday.occupied()).isEqualTo(SlotCoverage.FULL_DAY);
    }

    @Test
    void getRange_lasReglasOcupanSusDias_yUnaMarcaLibreLasAnula() {
        LocalDate tuesday = MONDAY.plusDays(1);
        given(MONDAY, tuesday,
                List.of(),
                List.of(DayMark.builder().date(tuesday).coverage(SlotCoverage.NONE).build()),
                List.of(weekdaysFullDay()));

        List<DayAvailability> days = availabilityService.getRange(MONDAY, tuesday);

        // El lunes lo ocupa la regla; el martes, por excepción, queda libre
        // (sale en la lista porque tiene una marca, pero no está ocupado).
        assertThat(days).hasSize(2);
        assertThat(days.get(0).occupied()).isEqualTo(SlotCoverage.FULL_DAY);
        assertThat(days.get(0).mark()).isNull();
        assertThat(days.get(1).occupied()).isEqualTo(SlotCoverage.NONE);
        assertThat(days.get(1).mark()).isEqualTo(SlotCoverage.NONE);
    }

    @Test
    void getRange_unaMarcaLibreNoQuitaUnaReservaConfirmada() {
        given(SATURDAY, SATURDAY,
                List.of(confirmed(1L, SATURDAY, TimeSlot.EVENING)),
                List.of(DayMark.builder().date(SATURDAY).coverage(SlotCoverage.NONE).build()),
                List.of());

        assertThat(availabilityService.getRange(SATURDAY, SATURDAY).get(0).occupied()).isEqualTo(SlotCoverage.EVENING);
    }

    @Test
    void getRange_conLasFechasAlReves_oUnPeriodoDemasiadoLargo_lanzaIllegalArgumentException() {
        LocalDate before = SATURDAY.minusDays(1);
        LocalDate farAway = SATURDAY.plusDays(AvailabilityService.MAX_RANGE_DAYS + 1);

        assertThatThrownBy(() -> availabilityService.getRange(SATURDAY, before))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> availabilityService.getRange(SATURDAY, farAway))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void isAvailableForRequest_tieneEnCuentaReservasYBloqueos() {
        given(MONDAY, MONDAY, List.of(), List.of(),
                List.of(AvailabilityRule.builder().daysOfWeek(EnumSet.of(DayOfWeek.MONDAY))
                        .coverage(SlotCoverage.MIDDAY).build()));

        assertThat(availabilityService.isAvailableForRequest(MONDAY, TimeSlot.MIDDAY)).isFalse();
        assertThat(availabilityService.isAvailableForRequest(MONDAY, TimeSlot.EVENING)).isTrue();
    }

    // ---- Marcas ----

    @Test
    void setMark_creaLaMarcaSiNoExiste_yLaCambiaSiYaExiste() {
        DayMark existing = DayMark.builder().id(3L).date(MONDAY).coverage(SlotCoverage.MIDDAY).build();
        when(dayMarkRepository.findByDate(SATURDAY)).thenReturn(Optional.empty());
        when(dayMarkRepository.findByDate(MONDAY)).thenReturn(Optional.of(existing));
        when(dayMarkRepository.save(any(DayMark.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DayMark created = availabilityService.setMark(SATURDAY, SlotCoverage.EVENING);
        DayMark changed = availabilityService.setMark(MONDAY, SlotCoverage.FULL_DAY);

        assertThat(created.getDate()).isEqualTo(SATURDAY);
        assertThat(created.getCoverage()).isEqualTo(SlotCoverage.EVENING);
        assertThat(changed.getId()).isEqualTo(3L);
        assertThat(changed.getCoverage()).isEqualTo(SlotCoverage.FULL_DAY);
    }

    @Test
    void clearMark_borraLaMarcaSiExiste_ySiNoNoHaceNada() {
        DayMark existing = DayMark.builder().id(3L).date(MONDAY).coverage(SlotCoverage.MIDDAY).build();
        when(dayMarkRepository.findByDate(MONDAY)).thenReturn(Optional.of(existing));
        when(dayMarkRepository.findByDate(SATURDAY)).thenReturn(Optional.empty());

        availabilityService.clearMark(MONDAY);
        availabilityService.clearMark(SATURDAY);

        // Solo se ha borrado la marca que existía.
        verify(dayMarkRepository).delete(existing);
        verify(dayMarkRepository).delete(any(DayMark.class));
    }
}
