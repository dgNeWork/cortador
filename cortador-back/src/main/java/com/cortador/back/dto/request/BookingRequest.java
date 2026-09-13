package com.cortador.back.dto.request;

import com.cortador.back.model.enums.EventType;
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
public class BookingRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Customer email must be valid")
    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Event time is required")
    private LocalTime eventTime;

    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Estimated duration must be greater than zero")
    private Integer estimatedDurationHours;

    @NotNull(message = "Event type is required")
    private EventType eventType;

    @NotNull(message = "Guest count is required")
    @Positive(message = "Guest count must be greater than zero")
    private Integer guestCount;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    // Solo es obligatorio si serviceType = FULL_SERVICE; esa comprobación
    // se hace en el servicio porque depende del valor de otro campo.
    private Long hamTypeId;

    @Size(max = 1000, message = "Notes must be at most 1000 characters")
    private String notes;
}
