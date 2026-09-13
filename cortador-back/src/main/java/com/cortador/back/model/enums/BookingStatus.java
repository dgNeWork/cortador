package com.cortador.back.model.enums;

/**
 * Estados por los que pasa una reserva, desde que el cliente la envía
 * hasta que se hace el evento (o se cancela).
 *
 * Flujo normal: PENDING -> CONFIRMED -> COMPLETED
 *               PENDING/CONFIRMED -> CANCELLED
 */
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
