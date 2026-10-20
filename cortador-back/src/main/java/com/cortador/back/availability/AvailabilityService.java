package com.cortador.back.availability;

import com.cortador.back.model.Booking;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.TimeSlot;
import com.cortador.back.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Objects;

/**
 * Único sitio que decide si una franja de un día está ocupada.
 *
 * Por ahora una franja solo la ocupa una reserva CONFIRMADA: las
 * solicitudes pendientes no bloquean nada (el cortador puede tener varias
 * para la misma fecha y quedarse con una). Más adelante aquí se añadirán
 * los días que el cortador marque como no disponibles en su calendario.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final BookingRepository bookingRepository;

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
}
