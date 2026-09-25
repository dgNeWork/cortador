package com.cortador.back.service.impl;

import com.cortador.back.dto.request.LocalityRequest;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Reglas de las localidades: sin nombres repetidos (sin importar
 * mayúsculas) y sin poder añadir la propia localidad del cortador.
 */
@ExtendWith(MockitoExtension.class)
class LocalityServiceImplTest {

    @Mock
    private LocalityRepository localityRepository;

    @Mock
    private PricingSettingsRepository pricingSettingsRepository;

    @InjectMocks
    private LocalityServiceImpl localityService;

    // El cortador vive en Jerez. No va en un @BeforeEach porque Mockito,
    // en modo estricto, falla si un test no usa algo que se le preparó
    // (UnnecessaryStubbing): solo lo llaman los tests que lo necesitan.
    private void givenCortadorLivesInJerez() {
        PricingSettings settings = PricingSettings.builder().homeLocality("Jerez de la Frontera").build();
        when(pricingSettingsRepository.findById(PricingSettings.SINGLETON_ID)).thenReturn(Optional.of(settings));
    }

    private LocalityRequest buildRequest(String name, int km) {
        LocalityRequest request = new LocalityRequest();
        request.setName(name);
        request.setDistanceKm(km);
        return request;
    }

    @Test
    void create_localidadNueva_laGuardaConElNombreSinEspaciosSobrantes() {
        givenCortadorLivesInJerez();
        when(localityRepository.save(any(Locality.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Locality result = localityService.create(buildRequest("  Cádiz ", 70));

        assertThat(result.getName()).isEqualTo("Cádiz");
        assertThat(result.getDistanceKm()).isEqualTo(70);
    }

    @Test
    void create_nombreRepetido_lanzaIllegalArgumentExceptionYNoGuarda() {
        givenCortadorLivesInJerez();
        when(localityRepository.existsByNameIgnoreCase("cádiz")).thenReturn(true);
        LocalityRequest request = buildRequest("cádiz", 70);

        assertThatThrownBy(() -> localityService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ya tienes");

        verify(localityRepository, never()).save(any());
    }

    @Test
    void create_laLocalidadDelCortador_lanzaIllegalArgumentExceptionYNoGuarda() {
        givenCortadorLivesInJerez();
        // Da igual cómo lo escriba: "jerez de la frontera" es su casa.
        LocalityRequest request = buildRequest("jerez de la frontera", 10);

        assertThatThrownBy(() -> localityService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("es tu localidad");

        verify(localityRepository, never()).save(any());
    }

    @Test
    void update_puedeCambiarLosKmManteniendoElMismoNombre() {
        givenCortadorLivesInJerez();
        Locality cadiz = Locality.builder().id(4L).name("Cádiz").distanceKm(70).build();
        when(localityRepository.findById(4L)).thenReturn(Optional.of(cadiz));
        when(localityRepository.save(any(Locality.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Locality result = localityService.update(4L, buildRequest("Cádiz", 76));

        // Guardar con el mismo nombre no cuenta como "repetido" porque la
        // comprobación excluye su propio id (existsByNameIgnoreCaseAndIdNot).
        verify(localityRepository).existsByNameIgnoreCaseAndIdNot("Cádiz", 4L);
        assertThat(result.getDistanceKm()).isEqualTo(76);
    }

    @Test
    void delete_localidadQueNoExiste_lanzaResourceNotFoundException() {
        when(localityRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> localityService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
