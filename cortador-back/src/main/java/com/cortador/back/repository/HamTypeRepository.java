package com.cortador.back.repository;

import com.cortador.back.model.HamType;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a los datos del catálogo de tipos de jamón (HamType).
 */
public interface HamTypeRepository extends JpaRepository<HamType, Long> {
}
