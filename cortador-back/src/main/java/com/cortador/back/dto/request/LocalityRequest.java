package com.cortador.back.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Datos de una localidad que añade o edita el cortador en su panel.
 */
@Getter
@Setter
public class LocalityRequest {

    @NotBlank(message = "El nombre de la localidad es obligatorio")
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
    private String name;

    // Tope de 2000 km para detectar errores al teclear (un cero de más).
    @NotNull(message = "Los kilómetros son obligatorios")
    @Positive(message = "Los kilómetros deben ser mayores que cero")
    @Max(value = 2000, message = "Los kilómetros no pueden pasar de 2000")
    private Integer distanceKm;
}
