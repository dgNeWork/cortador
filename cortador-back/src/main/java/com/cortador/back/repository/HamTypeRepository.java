package com.cortador.back.repository;

import com.cortador.back.model.HamType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acceso a los datos del catálogo de tipos de jamón (HamType).
 * Spring Data genera la consulta SQL a partir del nombre del método.
 */
public interface HamTypeRepository extends JpaRepository<HamType, Long> {

    // Catálogo del formulario público: solo los activos, ordenados por precio.
    List<HamType> findAllByActiveTrueOrderByPriceAsc();

    // Catálogo completo para el panel del cortador, activos e inactivos.
    List<HamType> findAllByOrderByPriceAsc();
}
