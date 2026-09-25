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
 * Tarifas que envía el cortador desde la pestaña "Tarifas" del panel.
 * Se permite 0 en los precios por si alguien no cobra desplazamiento.
 */
@Getter
@Setter
public class PricingSettingsRequest {

    @NotNull(message = "El precio por hora es obligatorio")
    @PositiveOrZero(message = "El precio por hora no puede ser negativo")
    @Digits(integer = 6, fraction = 2, message = "El precio por hora debe tener como mucho 2 decimales")
    private BigDecimal hourlyRate;

    @NotNull(message = "El precio por km es obligatorio")
    @PositiveOrZero(message = "El precio por km no puede ser negativo")
    @Digits(integer = 4, fraction = 2, message = "El precio por km debe tener como mucho 2 decimales")
    private BigDecimal pricePerKm;

    @NotBlank(message = "Tu localidad es obligatoria")
    @Size(max = 100, message = "La localidad no puede tener más de 100 caracteres")
    private String homeLocality;
}
