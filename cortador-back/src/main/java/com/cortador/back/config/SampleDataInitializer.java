package com.cortador.back.config;

import com.cortador.back.model.HamType;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.HamTypeRepository;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Datos de muestra para que la app no arranque vacía: sirven para
 * enseñarla a un cortador antes de vendérsela y como punto de partida,
 * que luego él cambia desde su panel.
 *
 * ESTE ES EL ÚNICO SITIO CON PRECIOS DE MUESTRA: si un cortador pide otros
 * valores iniciales, se cambian aquí.
 *
 * Solo rellena lo que esté vacío, así que nunca pisa lo que el cortador ya
 * ha configurado. Se puede apagar con SAMPLE_DATA_ENABLED=false.
 */
@Component
@RequiredArgsConstructor
public class SampleDataInitializer implements CommandLineRunner {

    // Un record es una clase de solo datos: aquí guardan los valores de
    // muestra, sin ser todavía entidades de la base de datos.
    record SampleHamType(String name, String description, String price) {
    }

    record SampleLocality(String name, int distanceKm) {
    }

    // ---- Catálogo de jamones ----
    static final List<SampleHamType> SAMPLE_HAM_TYPES = List.of(
            new SampleHamType("Jamón de cebo ibérico", "Pieza de 7-8 kg, curación mínima de 24 meses", "180.00"),
            new SampleHamType("Jamón de cebo de campo ibérico", "Pieza de 7-8 kg, curación mínima de 30 meses", "260.00"),
            new SampleHamType("Jamón de bellota ibérico", "Pieza de 7-8 kg, curación mínima de 36 meses", "390.00"));

    // ---- Tarifas ----
    static final String SAMPLE_HOURLY_RATE = "50.00";
    static final String SAMPLE_PRICE_PER_KM = "0.40";
    static final String SAMPLE_HOME_LOCALITY = "Jerez de la Frontera";

    // ---- Localidades (km del trayecto completo, ida y vuelta, aproximados) ----
    static final List<SampleLocality> SAMPLE_LOCALITIES = List.of(
            new SampleLocality("El Puerto de Santa María", 26),
            new SampleLocality("Sanlúcar de Barrameda", 48),
            new SampleLocality("Arcos de la Frontera", 64),
            new SampleLocality("Cádiz", 70));

    private final HamTypeRepository hamTypeRepository;
    private final PricingSettingsRepository pricingSettingsRepository;
    private final LocalityRepository localityRepository;

    @Value("${app.sample-data.enabled}")
    private boolean enabled;

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }
        seedHamTypes();
        seedPricingAndLocalities();
    }

    private void seedHamTypes() {
        if (hamTypeRepository.count() == 0) {
            hamTypeRepository.saveAll(SAMPLE_HAM_TYPES.stream().map(SampleDataInitializer::toHamType).toList());
        }
    }

    // Tarifas y localidades van juntas y solo la primera vez (cuando aún
    // no hay tarifas). Las tarifas no se pueden borrar, así que después
    // nunca se vuelve a sembrar: si el cortador borra todas sus localidades
    // porque no se desplaza, no reaparecen al reiniciar el servidor.
    private void seedPricingAndLocalities() {
        if (pricingSettingsRepository.count() > 0) {
            return;
        }
        pricingSettingsRepository.save(PricingSettings.builder()
                .hourlyRate(new BigDecimal(SAMPLE_HOURLY_RATE))
                .pricePerKm(new BigDecimal(SAMPLE_PRICE_PER_KM))
                .homeLocality(SAMPLE_HOME_LOCALITY)
                .build());
        if (localityRepository.count() == 0) {
            localityRepository.saveAll(SAMPLE_LOCALITIES.stream()
                    .map(sample -> Locality.builder().name(sample.name()).distanceKm(sample.distanceKm()).build())
                    .toList());
        }
    }

    private static HamType toHamType(SampleHamType sample) {
        return HamType.builder()
                .name(sample.name())
                .description(sample.description())
                .price(new BigDecimal(sample.price()))
                .build();
    }
}
