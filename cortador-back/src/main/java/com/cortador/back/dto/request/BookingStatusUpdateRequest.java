package com.cortador.back.dto.request;

import com.cortador.back.model.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Datos que envía el admin para cambiar el estado de una reserva
 * (por ejemplo, confirmarla o cancelarla).
 */
@Getter
@Setter
public class BookingStatusUpdateRequest {

    @NotNull(message = "El estado es obligatorio")
    private BookingStatus status;
}
