package com.cortador.back.service.impl;

import com.cortador.back.dto.request.HamTypeRequest;
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
        return hamTypeRepository.findAllByOrderByPriceAsc();
    }

    @Override
    public List<HamType> findAllActive() {
        return hamTypeRepository.findAllByActiveTrueOrderByPriceAsc();
    }

    @Override
    public HamType findById(Long id) {
        // Si no se encuentra el tipo de jamón, lanzamos un error 404 en vez
        // de devolver null (así el controlador no tiene que comprobarlo).
        return hamTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ningún jamón con id " + id));
    }

    @Override
    public HamType create(HamTypeRequest request) {
        HamType hamType = new HamType();
        applyRequest(hamType, request);
        return hamTypeRepository.save(hamType);
    }

    @Override
    public HamType update(Long id, HamTypeRequest request) {
        HamType hamType = findById(id);
        applyRequest(hamType, request);
        return hamTypeRepository.save(hamType);
    }

    // Copia los datos del formulario del panel a la entidad. Lo comparten
    // crear y editar. Si "active" no viene, se deja como estaba (un jamón
    // nuevo empieza activo por defecto, ver HamType).
    private void applyRequest(HamType hamType, HamTypeRequest request) {
        hamType.setName(request.getName().trim());
        hamType.setDescription(request.getDescription());
        hamType.setPrice(request.getPrice());
        if (request.getActive() != null) {
            hamType.setActive(request.getActive());
        }
    }
}
