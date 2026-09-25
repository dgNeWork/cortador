package com.cortador.back.service;

import com.cortador.back.dto.request.HamTypeRequest;
import com.cortador.back.model.HamType;

import java.util.List;

public interface HamTypeService {

    /** Catálogo completo (activos e inactivos), para el panel del cortador. */
    List<HamType> findAll();

    /** Solo los jamones activos, para el formulario público de reserva. */
    List<HamType> findAllActive();

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe ningún HamType con ese id
     */
    HamType findById(Long id);

    HamType create(HamTypeRequest request);

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe ningún HamType con ese id
     */
    HamType update(Long id, HamTypeRequest request);
}
