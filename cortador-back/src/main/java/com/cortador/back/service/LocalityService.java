package com.cortador.back.service;

import com.cortador.back.dto.request.LocalityRequest;
import com.cortador.back.model.Locality;

import java.util.List;

public interface LocalityService {

    /** Todas las localidades, de la más cercana a la más lejana. */
    List<Locality> findAll();

    /**
     * @throws IllegalArgumentException si el nombre ya existe o es la localidad del cortador
     */
    Locality create(LocalityRequest request);

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe
     * @throws IllegalArgumentException si el nombre ya existe o es la localidad del cortador
     */
    Locality update(Long id, LocalityRequest request);

    /**
     * @throws com.cortador.back.exception.ResourceNotFoundException si no existe
     */
    void delete(Long id);
}
