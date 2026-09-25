package com.cortador.back.service;

import com.cortador.back.dto.request.PricingSettingsRequest;
import com.cortador.back.model.PricingSettings;

import java.util.Optional;

public interface PricingSettingsService {

    /** Las tarifas del cortador, o vacío si todavía no las ha configurado. */
    Optional<PricingSettings> find();

    /**
     * Guarda las tarifas (las crea la primera vez).
     *
     * @throws IllegalArgumentException si la localidad de casa ya está en la lista de localidades
     */
    PricingSettings update(PricingSettingsRequest request);
}
