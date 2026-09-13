package com.cortador.back.service.impl;

import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.HamType;
import com.cortador.back.repository.HamTypeRepository;
import com.cortador.back.service.HamTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HamTypeServiceImpl implements HamTypeService {

    private final HamTypeRepository hamTypeRepository;

    @Override
    public List<HamType> findAll() {
        return hamTypeRepository.findAll();
    }

    @Override
    public HamType findById(Long id) {
        // Si no se encuentra el tipo de jamón, lanzamos un error 404 en vez
        // de devolver null (así el controlador no tiene que comprobarlo).
        return hamTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ham type not found with id " + id));
    }
}
