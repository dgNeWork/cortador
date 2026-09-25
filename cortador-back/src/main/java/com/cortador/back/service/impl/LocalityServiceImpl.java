package com.cortador.back.service.impl;

import com.cortador.back.dto.request.LocalityRequest;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import com.cortador.back.service.LocalityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalityServiceImpl implements LocalityService {

    private final LocalityRepository localityRepository;
    private final PricingSettingsRepository pricingSettingsRepository;

    @Override
    public List<Locality> findAll() {
        return localityRepository.findAllByOrderByDistanceKmAsc();
    }

    @Override
    public Locality create(LocalityRequest request) {
        String name = request.getName().trim();
        checkNotHomeLocality(name);
        if (localityRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ya tienes " + name + " en la lista");
        }

        Locality locality = Locality.builder().name(name).distanceKm(request.getDistanceKm()).build();
        return localityRepository.save(locality);
    }

    @Override
    public Locality update(Long id, LocalityRequest request) {
        Locality locality = findById(id);
        String name = request.getName().trim();
        checkNotHomeLocality(name);
        if (localityRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Ya tienes " + name + " en la lista");
        }

        locality.setName(name);
        locality.setDistanceKm(request.getDistanceKm());
        return localityRepository.save(locality);
    }

    // Se puede borrar sin miedo: las reservas guardarán su propia copia de
    // la localidad y del precio calculado, no un enlace a esta fila.
    @Override
    public void delete(Long id) {
        localityRepository.delete(findById(id));
    }

    private Locality findById(Long id) {
        return localityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna localidad con id " + id));
    }

    // La casa del cortador no se añade a la lista: allí el desplazamiento
    // es siempre 0 y ya sale la primera en el desplegable del cliente.
    private void checkNotHomeLocality(String name) {
        pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)
                .filter(settings -> settings.getHomeLocality().equalsIgnoreCase(name))
                .ifPresent(settings -> {
                    throw new IllegalArgumentException(name + " es tu localidad: ahí no cobras desplazamiento");
                });
    }
}
