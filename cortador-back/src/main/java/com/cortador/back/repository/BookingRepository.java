package com.cortador.back.repository;

import com.cortador.back.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a los datos de Booking, la entidad más importante de la app.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {
}
