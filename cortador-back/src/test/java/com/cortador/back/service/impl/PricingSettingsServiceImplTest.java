package com.cortador.back.service.impl;

import com.cortador.back.dto.request.PricingSettingsRequest;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingSettingsServiceImplTest {

    @Mock
    private PricingSettingsRepository pricingSettingsRepository;

    @Mock
    private LocalityRepository localityRepository;

    @InjectMocks
    private PricingSettingsServiceImpl pricingSettingsService;

    private PricingSettingsRequest buildRequest(String hourlyRate, String pricePerKm, String home) {
        PricingSettingsRequest request = new PricingSettingsRequest();
        request.setHourlyRate(new BigDecimal(hourlyRate));
        request.setPricePerKm(new BigDecimal(pricePerKm));
        request.setHomeLocality(home);
        return request;
    }

    @Test
    void update_laPrimeraVez_creaLaFilaUnicaDeTarifas() {
        when(pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)).thenReturn(Optional.empty());
        when(pricingSettingsRepository.save(any(PricingSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PricingSettings result = pricingSettingsService.update(buildRequest("55.00", "0.35", " Jerez "));

        assertThat(result.getId()).isEqualTo(PricingSettings.SINGLETON_ID);
        assertThat(result.getHourlyRate()).isEqualByComparingTo("55.00");
        assertThat(result.getHomeLocality()).isEqualTo("Jerez");
    }

    @Test
    void update_siYaHayTarifas_modificaLasExistentes() {
        PricingSettings existing = PricingSettings.builder()
                .hourlyRate(new BigDecimal("50.00"))
                .pricePerKm(new BigDecimal("0.40"))
                .homeLocality("Jerez")
                .build();
        when(pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)).thenReturn(Optional.of(existing));
        when(pricingSettingsRepository.save(any(PricingSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PricingSettings result = pricingSettingsService.update(buildRequest("60.00", "0.50", "Jerez"));

        // Es el mismo objeto que ya existía, no uno nuevo.
        assertThat(result).isSameAs(existing);
        assertThat(result.getPricePerKm()).isEqualByComparingTo("0.50");
    }

    @Test
    void update_conUnaCasaQueYaEstaEnLaListaDeLocalidades_lanzaIllegalArgumentException() {
        when(localityRepository.existsByNameIgnoreCase("Cádiz")).thenReturn(true);
        PricingSettingsRequest request = buildRequest("50.00", "0.40", "Cádiz");

        assertThatThrownBy(() -> pricingSettingsService.update(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ya está en tu lista");

        verify(pricingSettingsRepository, never()).save(any());
    }
}
