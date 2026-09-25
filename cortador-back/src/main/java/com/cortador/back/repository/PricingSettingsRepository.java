package com.cortador.back.repository;

import com.cortador.back.model.PricingSettings;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a la fila única de tarifas del cortador (ver PricingSettings).
 */
public interface PricingSettingsRepository extends JpaRepository<PricingSettings, Long> {
}
