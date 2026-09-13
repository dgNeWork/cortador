package com.cortador.back.exception;

/**
 * Se lanza cuando una acción rompería el flujo normal de estados de una
 * reserva, por ejemplo cambiar el estado de una reserva que ya está
 * CANCELLED o COMPLETED. El GlobalExceptionHandler la convierte en un
 * HTTP 409 (Conflict).
 */
public class InvalidBookingStateException extends RuntimeException {

    public InvalidBookingStateException(String message) {
        super(message);
    }
}
