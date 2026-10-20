package com.cortador.back.repository;

import com.cortador.back.model.Booking;
import com.cortador.back.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Acceso a los datos de Booking, la entidad más importante de la app.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Reservas de un día en un estado concreto. Lo usa AvailabilityService
    // para saber qué franjas están ocupadas por reservas confirmadas.
    List<Booking> findByEventDateAndStatus(LocalDate eventDate, BookingStatus status);
}
