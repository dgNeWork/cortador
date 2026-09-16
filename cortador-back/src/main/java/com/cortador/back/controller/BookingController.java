package com.cortador.back.controller;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.dto.request.BookingStatusUpdateRequest;
import com.cortador.back.dto.response.BookingResponse;
import com.cortador.back.model.Booking;
import com.cortador.back.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * El POST es público (lo usa el formulario de reserva del cliente).
 * El GET y el PATCH son para el panel de admin y exigen login (ver
 * SecurityConfig, que es quien decide qué rutas piden token).
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(booking));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAll() {
        List<BookingResponse> response = bookingService.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(bookingService.findById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id, @Valid @RequestBody BookingStatusUpdateRequest request) {
        Booking booking = bookingService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(toResponse(booking));
    }

    // Convierte la entidad Booking (con sus relaciones) en el DTO plano
    // que se envía al frontend.
    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .customerName(booking.getCustomer().getName())
                .customerEmail(booking.getCustomer().getEmail())
                .customerPhone(booking.getCustomer().getPhone())
                .eventDate(booking.getEventDate())
                .eventTime(booking.getEventTime())
                .estimatedDurationHours(booking.getEstimatedDurationHours())
                .eventType(booking.getEventType())
                .guestCount(booking.getGuestCount())
                .location(booking.getLocation())
                .serviceType(booking.getServiceType())
                .hamTypeName(booking.getHamType() != null ? booking.getHamType().getName() : null)
                .status(booking.getStatus())
                .estimatedPrice(booking.getEstimatedPrice())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
