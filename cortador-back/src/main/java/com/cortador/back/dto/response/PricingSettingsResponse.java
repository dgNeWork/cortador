package com.cortador.back.dto.response;

import com.cortador.back.model.PricingSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Tarifas del cortador que se devuelven al panel. Si todavía no las ha
 * configurado (y los datos de muestra están apagados), todos los campos
 * van a null y el panel muestra el formulario vacío.
 */
@Getter
@Builder
@AllArgsConstructor
public class PricingSettingsResponse {
    private BigDecimal hourlyRate;
    private BigDecimal pricePerKm;
    private String homeLocality;

    public static PricingSettingsResponse from(PricingSettings settings) {
        return PricingSettingsResponse.builder()
                .hourlyRate(settings.getHourlyRate())
                .pricePerKm(settings.getPricePerKm())
                .homeLocality(settings.getHomeLocality())
                .build();
    }

    public static PricingSettingsResponse empty() {
        return PricingSettingsResponse.builder().build();
    }
}
