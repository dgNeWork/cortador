package com.cortador.back.service;

import com.cortador.back.model.HamType;

import java.util.List;

public interface HamTypeService {

    List<HamType> findAll();

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe ningún HamType con ese id
     */
    HamType findById(Long id);
}
