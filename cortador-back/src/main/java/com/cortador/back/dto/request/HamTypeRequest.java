package com.cortador.back.dto.request;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Datos que envía el panel del cortador para crear o editar un tipo de
 * jamón. Se usa el mismo DTO para las dos cosas porque los campos son los
 * mismos; al editar, "active" sirve también para activarlo o desactivarlo.
 */
@Getter
@Setter
public class HamTypeRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
    private String name;

    @Size(max = 255, message = "La descripción no puede tener más de 255 caracteres")
    private String description;

    // @Digits: como mucho 6 cifras enteras y 2 decimales (céntimos).
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    @Digits(integer = 6, fraction = 2, message = "El precio debe tener como mucho 2 decimales")
    private BigDecimal price;

    // Opcional: si no se envía al crear, el jamón empieza activo.
    private Boolean active;
}
