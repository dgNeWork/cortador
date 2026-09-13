package com.cortador.back.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Forma fija en JSON para cualquier error que devuelva la API, así el
 * frontend siempre sabe qué esperar, sin adivinar según el endpoint.
 */
@Getter
@Builder
@AllArgsConstructor
public class ApiError {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    // Campo -> mensaje de error. Solo se rellena cuando falla una validación @Valid.
    private Map<String, String> fieldErrors;
}
