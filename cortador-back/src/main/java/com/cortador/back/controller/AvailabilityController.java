package com.cortador.back.controller;

import com.cortador.back.availability.AvailabilityService;
import com.cortador.back.dto.response.PublicDayAvailabilityResponse;
import com.cortador.back.model.enums.SlotCoverage;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Calendario público del formulario de reserva: qué días y franjas están
 * ocupados en un periodo, sin ningún dato de las reservas.
 * Ejemplo: GET /api/availability?from=2026-11-01&to=2026-11-30
 */
@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<List<PublicDayAvailabilityResponse>> getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        // Los días que solo tienen una marca "libre" no le interesan al cliente.
        return ResponseEntity.ok(availabilityService.getRange(from, to).stream()
                .map(PublicDayAvailabilityResponse::from)
                .filter(day -> day.occupied() != SlotCoverage.NONE)
                .toList());
    }
}
