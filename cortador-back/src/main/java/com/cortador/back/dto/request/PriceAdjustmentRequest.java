package com.cortador.back.dto.request;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Ajuste manual del precio de una reserva desde el panel. El motivo es
 * obligatorio para que siempre quede constancia de por qué cambió.
 */
@Getter
@Setter
public class PriceAdjustmentRequest {

    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio no puede ser negativo")
    @Digits(integer = 6, fraction = 2, message = "El precio debe tener como mucho 2 decimales")
    private BigDecimal finalPrice;

    @NotBlank(message = "Escribe el motivo del cambio de precio")
    @Size(max = 255, message = "El motivo no puede tener más de 255 caracteres")
    private String note;
}
