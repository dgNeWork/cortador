package com.cortador.back.service;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.model.Booking;
import com.cortador.back.model.enums.BookingStatus;

import java.math.BigDecimal;
import java.util.List;

public interface BookingService {

    /**
     * Crea una reserva a partir del formulario público. Calcula el precio
     * (y guarda una copia del desglose), busca o crea el cliente por email
     * y deja la reserva en estado PENDING.
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

    /**
     * El cortador fija a mano el precio final (un descuento, lo hablado por
     * teléfono...) con un motivo. El precio calculado no se toca.
     *
     * @throws com.cortador.back.exception.InvalidBookingStateException si la reserva está cancelada
     */
    Booking adjustPrice(Long id, BigDecimal finalPrice, String note);
}
