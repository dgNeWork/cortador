package com.cortador.back.service;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.model.Booking;
import com.cortador.back.model.enums.BookingStatus;

import java.util.List;

public interface BookingService {

    /**
     * Crea una reserva a partir del formulario público. Busca (o crea) el
     * cliente por email y, si es FULL_SERVICE, también busca el jamón
     * elegido. Toda reserva nueva empieza en estado PENDING.
     */
    Booking create(BookingRequest request);

    List<Booking> findAll();

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe ninguna reserva con ese id
     */
    Booking findById(Long id);

    /**
     * Cambia el estado de una reserva.
     *
     * @throws com.cortador.back.exception.InvalidBookingStateException si la reserva ya está
     *                                                                  CANCELLED o COMPLETED
     */
    Booking updateStatus(Long id, BookingStatus newStatus);
}
