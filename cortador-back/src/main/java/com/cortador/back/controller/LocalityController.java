package com.cortador.back.controller;

import com.cortador.back.dto.response.LocalityResponse;
import com.cortador.back.dto.response.PublicLocalitiesResponse;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.service.LocalityService;
import com.cortador.back.service.PricingSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Localidades para el desplegable del formulario público de reserva.
 * De solo lectura: la gestión está en AdminLocalityController.
 */
@RestController
@RequestMapping("/api/localities")
@RequiredArgsConstructor
public class LocalityController {

    private final LocalityService localityService;
    private final PricingSettingsService pricingSettingsService;

    @GetMapping
    public ResponseEntity<PublicLocalitiesResponse> getAll() {
        String homeLocality = pricingSettingsService.find().map(PricingSettings::getHomeLocality).orElse(null);
        List<LocalityResponse> localities = localityService.findAll().stream().map(LocalityResponse::from).toList();
        return ResponseEntity.ok(new PublicLocalitiesResponse(homeLocality, localities));
    }
}
