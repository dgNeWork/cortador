package com.cortador.back.pricing;

import com.cortador.back.dto.request.QuoteRequest;
import com.cortador.back.model.HamType;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.model.enums.LocalityOption;
import com.cortador.back.model.enums.ServiceType;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.service.HamTypeService;
import com.cortador.back.service.PricingSettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * QuoteService decide QUÉ datos se usan para el precio (qué jamón, qué
 * localidad y cuántos km) y aplica las reglas de negocio. Las cuentas en
 * sí las hace la PriceCalculator real (no un mock), porque es simple y
 * así el test comprueba también que se le pasan bien los datos.
 */
@ExtendWith(MockitoExtension.class)
class QuoteServiceTest {

    @Mock
    private PricingSettingsService pricingSettingsService;

    @Mock
    private HamTypeService hamTypeService;

    @Mock
    private LocalityRepository localityRepository;

    private QuoteService quoteService;

    private final PricingSettings settings = PricingSettings.builder()
            .hourlyRate(new BigDecimal("50.00"))
            .pricePerKm(new BigDecimal("0.40"))
            .homeLocality("Jerez de la Frontera")
            .build();

    @BeforeEach
    void setUp() {
        quoteService = new QuoteService(pricingSettingsService, hamTypeService, localityRepository, new PriceCalculator());
    }

    private QuoteRequest request(ServiceType serviceType, Long hamTypeId, LocalityOption option) {
        QuoteRequest request = new QuoteRequest();
        request.setEstimatedDurationHours(2);
        request.setServiceType(serviceType);
        request.setHamTypeId(hamTypeId);
        request.setLocalityOption(option);
        return request;
    }

    @Test
    void enCasaDelCortador_usaSuLocalidadYCeroKm() {
        when(pricingSettingsService.find()).thenReturn(Optional.of(settings));

        Quote quote = quoteService.quote(request(ServiceType.CUT_ONLY, null, LocalityOption.HOME));

        assertThat(quote.localityName()).isEqualTo("Jerez de la Frontera");
        assertThat(quote.breakdown().distanceKm()).isZero();
        assertThat(quote.breakdown().total()).isEqualByComparingTo("100.00");
    }

    @Test
    void enUnaLocalidadDeLaLista_cobraSusKm() {
        when(pricingSettingsService.find()).thenReturn(Optional.of(settings));
        when(localityRepository.findById(4L))
                .thenReturn(Optional.of(Locality.builder().id(4L).name("Cádiz").distanceKm(70).build()));
        QuoteRequest request = request(ServiceType.CUT_ONLY, null, LocalityOption.LISTED);
        request.setLocalityId(4L);

        Quote quote = quoteService.quote(request);

        assertThat(quote.localityName()).isEqualTo("Cádiz");
        // 100 € de servicio + 70 km x 0,40 € = 128 €.
        assertThat(quote.breakdown().total()).isEqualByComparingTo("128.00");
    }

    @Test
    void enOtraLocalidad_guardaElNombreQueEscribeElClienteYElPrecioEsAConsultar() {
        when(pricingSettingsService.find()).thenReturn(Optional.of(settings));
        QuoteRequest request = request(ServiceType.CUT_ONLY, null, LocalityOption.OTHER);
        request.setOtherLocalityName("  Vejer de la Frontera ");

        Quote quote = quoteService.quote(request);

        assertThat(quote.localityName()).isEqualTo("Vejer de la Frontera");
        assertThat(quote.breakdown().onRequest()).isTrue();
    }

    @Test
    void otraLocalidadSinEscribirla_lanzaIllegalArgumentException() {
        QuoteRequest request = request(ServiceType.CUT_ONLY, null, LocalityOption.OTHER);
        request.setOtherLocalityName("   ");

        assertThatThrownBy(() -> quoteService.quote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Escribe la localidad del evento");
    }

    @Test
    void localidadDeLaListaQueYaNoExiste_lanzaIllegalArgumentException() {
        when(localityRepository.findById(9L)).thenReturn(Optional.empty());
        QuoteRequest request = request(ServiceType.CUT_ONLY, null, LocalityOption.LISTED);
        request.setLocalityId(9L);

        assertThatThrownBy(() -> quoteService.quote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La localidad elegida ya no está disponible");
    }

    @Test
    void servicioCompletoSinJamon_lanzaIllegalArgumentException() {
        QuoteRequest request = request(ServiceType.FULL_SERVICE, null, LocalityOption.HOME);

        assertThatThrownBy(() -> quoteService.quote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Para el servicio completo hay que elegir un jamón");
    }

    @Test
    void servicioCompletoConUnJamonDesactivado_lanzaIllegalArgumentException() {
        // Caso real: el cliente abrió el formulario, el cortador retiró ese
        // jamón del catálogo y después el cliente siguió rellenando.
        when(hamTypeService.findById(3L))
                .thenReturn(HamType.builder().id(3L).name("Bellota").price(BigDecimal.TEN).active(false).build());
        QuoteRequest request = request(ServiceType.FULL_SERVICE, 3L, LocalityOption.HOME);

        assertThatThrownBy(() -> quoteService.quote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El jamón elegido ya no está disponible");
    }

    @Test
    void soloCorte_ignoraElJamonAunqueVengaUnId() {
        // Si el cliente eligió un jamón y luego cambió a "solo corte", el
        // formulario puede mandar el id igualmente: no se debe cobrar.
        when(pricingSettingsService.find()).thenReturn(Optional.of(settings));

        Quote quote = quoteService.quote(request(ServiceType.CUT_ONLY, 3L, LocalityOption.HOME));

        assertThat(quote.hamType()).isNull();
        assertThat(quote.breakdown().hamCost()).isNull();
    }
}
