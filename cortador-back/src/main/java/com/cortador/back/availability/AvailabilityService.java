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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Único sitio que decide qué está ocupado en el calendario.
 *
 * Un día se calcula así:
 * - Las reservas CONFIRMADAS ocupan siempre su franja (las pendientes no
 *   bloquean nada: el cortador puede tener varias y quedarse con una).
 * - El cortador bloquea días con su marca de ese día o, si no la hay, con
 *   sus reglas habituales. La marca manda sobre las reglas.
 * - Lo ocupado es la suma de las dos cosas.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    // Máximo de días que se pueden pedir de una vez (algo más de un año),
    // para que nadie pueda pedirle al servidor un calendario de siglos.
    static final long MAX_RANGE_DAYS = 400;

    private final BookingRepository bookingRepository;
    private final DayMarkRepository dayMarkRepository;
    private final AvailabilityRuleRepository availabilityRuleRepository;

    /**
     * Indica si ya hay una reserva confirmada ese día en esa franja.
     *
     * @param excludedBookingId reserva que no se tiene en cuenta (la que se
     *                          está confirmando, para no chocar consigo misma);
     *                          null si no hay que excluir ninguna
     */
    public boolean isTakenByConfirmedBooking(LocalDate date, TimeSlot slot, Long excludedBookingId) {
        return bookingRepository.findByEventDateAndStatus(date, BookingStatus.CONFIRMED).stream()
                .filter(booking -> !Objects.equals(booking.getId(), excludedBookingId))
                .map(Booking::effectiveTimeSlot)
                .anyMatch(slot::equals);
    }

    // Indica si un cliente puede pedir esa franja: ni reservada ni bloqueada.
    public boolean isAvailableForRequest(LocalDate date, TimeSlot slot) {
        return getRange(date, date).stream()
                .noneMatch(day -> day.occupied().covers(slot));
    }

    /**
     * Estado de cada día de un periodo (ambos incluidos). Solo devuelve los
     * días que tienen algo (algo ocupado o una marca); los que no salen
     * están libres.
     *
     * @throws IllegalArgumentException si el periodo está al revés o es demasiado largo
     */
    public List<DayAvailability> getRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("La fecha final no puede ser anterior a la inicial");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("Solo se puede consultar un periodo de hasta " + MAX_RANGE_DAYS + " días");
        }

        Map<LocalDate, SlotCoverage> bookedByDate = bookedByDate(from, to);
        Map<LocalDate, DayMark> marksByDate = dayMarkRepository.findByDateBetween(from, to).stream()
                .collect(Collectors.toMap(DayMark::getDate, Function.identity()));
        List<AvailabilityRule> rules = availabilityRuleRepository.findAll();

        List<DayAvailability> days = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            SlotCoverage booked = bookedByDate.getOrDefault(date, SlotCoverage.NONE);
            DayMark mark = marksByDate.get(date);
            SlotCoverage blocked = mark != null ? mark.getCoverage() : coverageFromRules(rules, date);
            SlotCoverage occupied = booked.plus(blocked);

            if (occupied != SlotCoverage.NONE || mark != null) {
                days.add(new DayAvailability(date, booked, mark != null ? mark.getCoverage() : null, blocked, occupied));
            }
        }
        return days;
    }

    // Pone (o cambia) la marca de un día.
    @Transactional
    public DayMark setMark(LocalDate date, SlotCoverage coverage) {
        DayMark mark = dayMarkRepository.findByDate(date)
                .orElseGet(() -> DayMark.builder().date(date).build());
        mark.setCoverage(coverage);
        return dayMarkRepository.save(mark);
    }

    // Quita la marca de un día: vuelve a mandar lo que digan las reglas.
    @Transactional
    public void clearMark(LocalDate date) {
        dayMarkRepository.findByDate(date).ifPresent(dayMarkRepository::delete);
    }

    // Lo que ocupan las reservas confirmadas de cada día del periodo.
    private Map<LocalDate, SlotCoverage> bookedByDate(LocalDate from, LocalDate to) {
        Map<LocalDate, SlotCoverage> result = new HashMap<>();
        for (Booking booking : bookingRepository.findByEventDateBetweenAndStatus(from, to, BookingStatus.CONFIRMED)) {
            result.merge(booking.getEventDate(), SlotCoverage.of(booking.effectiveTimeSlot()), SlotCoverage::plus);
        }
        return result;
    }

    // Suma de todas las reglas que se aplican a esa fecha.
    private SlotCoverage coverageFromRules(List<AvailabilityRule> rules, LocalDate date) {
        return rules.stream()
                .filter(rule -> rule.appliesTo(date))
                .map(AvailabilityRule::getCoverage)
                .reduce(SlotCoverage.NONE, SlotCoverage::plus);
    }
}
