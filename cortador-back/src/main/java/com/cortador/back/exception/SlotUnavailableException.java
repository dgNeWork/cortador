package com.cortador.back.exception;

/**
 * Se lanza cuando el cliente pide una franja que ya está ocupada (por
 * ejemplo, otra persona ha reservado ese mismo día y franja mientras él
 * rellenaba el formulario). El GlobalExceptionHandler la convierte en un
 * HTTP 409 (Conflict) con un mensaje que le invita a elegir otra.
 */
public class SlotUnavailableException extends RuntimeException {

    public SlotUnavailableException(String message) {
        super(message);
    }
}
