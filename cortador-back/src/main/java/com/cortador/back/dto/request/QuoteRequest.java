package com.cortador.back.dto.request;

import com.cortador.back.model.enums.LocalityOption;
import com.cortador.back.model.enums.ServiceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Lo que manda el formulario de reserva para enseñar el precio en vivo,
 * antes de enviar la reserva: solo los campos de los que depende el precio.
 */
@Getter
@Setter
public class QuoteRequest implements PricingInput {

    @NotNull(message = "La duración es obligatoria")
    @Positive(message = "La duración debe ser de al menos 1 hora")
    private Integer estimatedDurationHours;

    @NotNull(message = "El tipo de servicio es obligatorio")
    private ServiceType serviceType;

    private Long hamTypeId;

    @NotNull(message = "La localidad es obligatoria")
    private LocalityOption localityOption;

    private Long localityId;

    @Size(max = 100, message = "La localidad no puede tener más de 100 caracteres")
    private String otherLocalityName;
}
