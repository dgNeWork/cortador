package com.cortador.back.dto.request;

import com.cortador.back.model.enums.EventType;
import com.cortador.back.model.enums.LocalityOption;
import com.cortador.back.model.enums.ServiceType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Forma de los datos que llegan desde el formulario público de reserva.
 * Las validaciones van aquí (es la puerta de entrada de datos del
 * usuario), no en la clase Booking.
 */
@Getter
@Setter
public class BookingRequest implements PricingInput {

    @NotBlank(message = "El nombre es obligatorio")
    private String customerName;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String customerEmail;

    @NotBlank(message = "El teléfono es obligatorio")
    private String customerPhone;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha no puede ser anterior a hoy")
    private LocalDate eventDate;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime eventTime;

    @NotNull(message = "La duración es obligatoria")
    @Positive(message = "La duración debe ser de al menos 1 hora")
    private Integer estimatedDurationHours;

    @NotNull(message = "El tipo de evento es obligatorio")
    private EventType eventType;

    @NotNull(message = "El número de invitados es obligatorio")
    @Positive(message = "Debe haber al menos 1 invitado")
    private Integer guestCount;

    @NotBlank(message = "La ubicación es obligatoria")
    private String location;

    @NotNull(message = "El tipo de servicio es obligatorio")
    private ServiceType serviceType;

    // Solo es obligatorio si serviceType = FULL_SERVICE; esa comprobación
    // se hace en el servicio porque depende del valor de otro campo.
    private Long hamTypeId;

    @NotNull(message = "La localidad es obligatoria")
    private LocalityOption localityOption;

    // Igual que hamTypeId: solo hace falta con ciertos valores de
    // localityOption, así que se comprueba en QuoteService.
    private Long localityId;

    @Size(max = 100, message = "La localidad no puede tener más de 100 caracteres")
    private String otherLocalityName;

    @Size(max = 1000, message = "Las notas no pueden tener más de 1000 caracteres")
    private String notes;
}
