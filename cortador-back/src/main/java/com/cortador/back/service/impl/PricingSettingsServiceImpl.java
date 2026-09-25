package com.cortador.back.service.impl;

import com.cortador.back.dto.request.PricingSettingsRequest;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import com.cortador.back.service.PricingSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PricingSettingsServiceImpl implements PricingSettingsService {

    private final PricingSettingsRepository pricingSettingsRepository;
    private final LocalityRepository localityRepository;

    @Override
    public Optional<PricingSettings> find() {
        return pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID);
    }

    @Override
    public PricingSettings update(PricingSettingsRequest request) {
        String homeLocality = request.getHomeLocality().trim();

        // Si la casa también estuviera en la lista, el cliente la vería dos
        // veces en el desplegable (una gratis y otra cobrando km).
        if (localityRepository.existsByNameIgnoreCase(homeLocality)) {
            throw new IllegalArgumentException(
                    homeLocality + " ya está en tu lista de localidades: quítala de la lista antes de ponerla como tu localidad");
        }

        // Si no existían tarifas, se crea la fila única; si existían, se actualiza.
        PricingSettings settings = find().orElseGet(PricingSettings::new);
        settings.setHourlyRate(request.getHourlyRate());
        settings.setPricePerKm(request.getPricePerKm());
        settings.setHomeLocality(homeLocality);
        return pricingSettingsRepository.save(settings);
    }
}
