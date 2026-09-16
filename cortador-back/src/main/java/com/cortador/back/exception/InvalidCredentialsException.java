package com.cortador.back.exception;

/**
 * Email o contraseña incorrectos al hacer login. Se usa un mensaje
 * genérico a propósito (no decir cuál de los dos falla), para no dar
 * pistas a quien intente adivinar credenciales.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
