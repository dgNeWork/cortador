package com.cortador.back.exception;

/**
 * Se lanza cuando se busca algo por id (o parecido) y no existe.
 * El GlobalExceptionHandler la convierte en una respuesta HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
