package com.cortador.back.dto.response;

import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.EventType;
import com.cortador.back.model.enums.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Lo que la API devuelve de una reserva: los datos del cliente y del
 * jamón se ponen en campos simples, en vez de mandar toda la entidad
 * con sus relaciones (evita problemas de lazy-loading al convertir a JSON).
 */
@Getter
@Builder
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private Integer estimatedDurationHours;
    private EventType eventType;
    private Integer guestCount;
    private String location;
    private ServiceType serviceType;
    private String hamTypeName;
    private BookingStatus status;
    private String localityName;
    private Integer distanceKm;
    private BigDecimal serviceCost;
    private BigDecimal hamCost;
    private BigDecimal travelCost;
    // Total calculado (null si era "a consultar").
    private BigDecimal estimatedPrice;
    // Precio ajustado por el cortador y su motivo (null si no lo ha tocado).
    private BigDecimal finalPrice;
    private String priceNote;
    private String notes;
    private LocalDateTime createdAt;
}
