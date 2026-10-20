package com.cortador.back.repository;

import com.cortador.back.model.AvailabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a las reglas habituales de no disponibilidad del cortador. Son
 * pocas (una o dos por cortador), así que se leen siempre todas.
 */
public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, Long> {
}
