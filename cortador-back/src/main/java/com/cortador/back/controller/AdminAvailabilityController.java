package com.cortador.back.controller;

import com.cortador.back.availability.AvailabilityRuleService;
import com.cortador.back.availability.AvailabilityService;
import com.cortador.back.availability.DayAvailability;
import com.cortador.back.dto.request.AvailabilityRuleRequest;
import com.cortador.back.dto.request.DayMarkRequest;
import com.cortador.back.dto.response.AvailabilityRuleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Calendario del panel del cortador: el estado de cada día con su porqué,
 * las marcas de días concretos y las reglas habituales. Todo bajo
 * /api/admin, así que solo entra el cortador con su sesión iniciada.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAvailabilityController {

    private final AvailabilityService availabilityService;
    private final AvailabilityRuleService availabilityRuleService;

    @GetMapping("/availability")
    public ResponseEntity<List<DayAvailability>> getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(availabilityService.getRange(from, to));
    }

    // ---- Marcas de días concretos ----

    @PutMapping("/day-marks/{date}")
    public ResponseEntity<Void> setMark(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody DayMarkRequest request) {
        availabilityService.setMark(date, request.getCoverage());
        return ResponseEntity.noContent().build();
    }

    // Quitar la marca: el día vuelve a lo que digan las reglas.
    @DeleteMapping("/day-marks/{date}")
    public ResponseEntity<Void> clearMark(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        availabilityService.clearMark(date);
        return ResponseEntity.noContent().build();
    }

    // ---- Reglas habituales ----

    @GetMapping("/availability-rules")
    public ResponseEntity<List<AvailabilityRuleResponse>> getRules() {
        return ResponseEntity.ok(availabilityRuleService.findAll().stream().map(AvailabilityRuleResponse::from).toList());
    }

    @PostMapping("/availability-rules")
    public ResponseEntity<AvailabilityRuleResponse> createRule(@Valid @RequestBody AvailabilityRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AvailabilityRuleResponse.from(availabilityRuleService.create(request)));
    }

    @PutMapping("/availability-rules/{id}")
    public ResponseEntity<AvailabilityRuleResponse> updateRule(
            @PathVariable Long id, @Valid @RequestBody AvailabilityRuleRequest request) {
        return ResponseEntity.ok(AvailabilityRuleResponse.from(availabilityRuleService.update(id, request)));
    }

    @DeleteMapping("/availability-rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        availabilityRuleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
