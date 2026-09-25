package com.cortador.back.pricing;

import com.cortador.back.model.HamType;
import com.cortador.back.model.PricingSettings;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PriceCalculator solo hace cuentas (no usa base de datos ni nada de
 * Spring), así que se prueba creándolo con "new" y comprobando números.
 * Es el tipo de test más sencillo y más rápido que hay: ni mocks ni contexto.
 *
 * Tarifas de todos los tests: 50 €/hora y 0,40 €/km.
 */
class PriceCalculatorTest {

    private final PriceCalculator calculator = new PriceCalculator();

    private final PricingSettings settings = PricingSettings.builder()
            .hourlyRate(new BigDecimal("50.00"))
            .pricePerKm(new BigDecimal("0.40"))
            .homeLocality("Jerez de la Frontera")
            .build();

    private final HamType bellota = HamType.builder().name("Bellota").price(new BigDecimal("390.00")).build();

    @Test
    void enLaLocalidadDelCortador_soloCortar_cobraSoloLasHoras() {
        // 3 h x 50 € = 150 €, sin jamón y con 0 km de desplazamiento.
        PriceBreakdown result = calculator.calculate(settings, 3, null, 0);

        assertThat(result.serviceCost()).isEqualByComparingTo("150.00");
        assertThat(result.hamCost()).isNull();
        assertThat(result.travelCost()).isEqualByComparingTo("0.00");
        assertThat(result.total()).isEqualByComparingTo("150.00");
        assertThat(result.onRequest()).isFalse();
    }

    @Test
    void servicioCompletoFueraDeCasa_sumaHorasJamonYDesplazamiento() {
        // 2 h x 50 € = 100 €  +  jamón 390 €  +  70 km x 0,40 € = 28 €  =  518 €
        PriceBreakdown result = calculator.calculate(settings, 2, bellota, 70);

        assertThat(result.serviceCost()).isEqualByComparingTo("100.00");
        assertThat(result.hamCost()).isEqualByComparingTo("390.00");
        assertThat(result.travelCost()).isEqualByComparingTo("28.00");
        assertThat(result.total()).isEqualByComparingTo("518.00");
    }

    @Test
    void localidadFueraDeLaLista_elDesplazamientoYElTotalSonAConsultar() {
        PriceBreakdown result = calculator.calculate(settings, 2, bellota, null);

        // Lo que sí se sabe se sigue enseñando al cliente.
        assertThat(result.serviceCost()).isEqualByComparingTo("100.00");
        assertThat(result.hamCost()).isEqualByComparingTo("390.00");
        assertThat(result.travelCost()).isNull();
        assertThat(result.total()).isNull();
        assertThat(result.onRequest()).isTrue();
    }

    @Test
    void sinTarifasConfiguradas_todoEsAConsultarSalvoElJamon() {
        PriceBreakdown result = calculator.calculate(null, 2, bellota, 0);

        assertThat(result.serviceCost()).isNull();
        assertThat(result.hamCost()).isEqualByComparingTo("390.00");
        assertThat(result.total()).isNull();
        assertThat(result.onRequest()).isTrue();
    }

    @Test
    void redondeaACentimos() {
        // 0,33 €/km x 25 km = 8,25 €  ;  45,55 €/h x 3 h = 136,65 €
        PricingSettings oddSettings = PricingSettings.builder()
                .hourlyRate(new BigDecimal("45.55"))
                .pricePerKm(new BigDecimal("0.33"))
                .homeLocality("Jerez")
                .build();

        PriceBreakdown result = calculator.calculate(oddSettings, 3, null, 25);

        assertThat(result.travelCost()).isEqualByComparingTo("8.25");
        assertThat(result.total()).isEqualByComparingTo("144.90");
        assertThat(result.total().scale()).isEqualTo(2);
    }
}
