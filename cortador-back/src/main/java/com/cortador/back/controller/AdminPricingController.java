package com.cortador.back.controller;

import com.cortador.back.dto.request.PricingSettingsRequest;
import com.cortador.back.dto.response.PricingSettingsResponse;
import com.cortador.back.service.PricingSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tarifas del cortador (€/hora, €/km y su localidad), desde el panel.
 * Es un único recurso, así que no lleva id: GET para leerlo y PUT para
 * guardarlo (lo crea la primera vez).
 */
@RestController
@RequestMapping("/api/admin/pricing")
@RequiredArgsConstructor
public class AdminPricingController {

    private final PricingSettingsService pricingSettingsService;

    @GetMapping
    public ResponseEntity<PricingSettingsResponse> get() {
        return ResponseEntity.ok(pricingSettingsService.find()
                .map(PricingSettingsResponse::from)
                .orElseGet(PricingSettingsResponse::empty));
    }

    @PutMapping
    public ResponseEntity<PricingSettingsResponse> update(@Valid @RequestBody PricingSettingsRequest request) {
        return ResponseEntity.ok(PricingSettingsResponse.from(pricingSettingsService.update(request)));
    }
}
