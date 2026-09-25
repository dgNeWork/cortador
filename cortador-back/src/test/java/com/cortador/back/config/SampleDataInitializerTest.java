package com.cortador.back.config;

import com.cortador.back.model.HamType;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.repository.HamTypeRepository;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.repository.PricingSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * La regla más importante de los datos de muestra es que nunca pisen lo
 * que el cortador ya ha configurado: solo rellenan tablas vacías.
 */
@ExtendWith(MockitoExtension.class)
class SampleDataInitializerTest {

    @Mock
    private HamTypeRepository hamTypeRepository;

    @Mock
    private PricingSettingsRepository pricingSettingsRepository;

    @Mock
    private LocalityRepository localityRepository;

    @InjectMocks
    private SampleDataInitializer initializer;

    // Un captor "atrapa" el argumento con el que se llamó a un mock, para
    // poder comprobar después qué se intentó guardar.
    @Captor
    private ArgumentCaptor<List<HamType>> savedHamTypes;

    @Captor
    private ArgumentCaptor<List<Locality>> savedLocalities;

    @Captor
    private ArgumentCaptor<PricingSettings> savedSettings;

    // "enabled" lo rellena Spring con @Value; aquí lo ponemos a mano.
    private void setEnabled(boolean enabled) {
        ReflectionTestUtils.setField(initializer, "enabled", enabled);
    }

    // Si no se indica otra cosa, un mock de Mockito devuelve 0 en count():
    // es decir, por defecto las tres tablas "están vacías".

    @Test
    void conTodoVacio_creaJamonesTarifasYLocalidadesDeMuestra() {
        setEnabled(true);

        initializer.run();

        verify(hamTypeRepository).saveAll(savedHamTypes.capture());
        assertThat(savedHamTypes.getValue())
                .hasSize(SampleDataInitializer.SAMPLE_HAM_TYPES.size())
                .allMatch(HamType::isActive);

        verify(pricingSettingsRepository).save(savedSettings.capture());
        assertThat(savedSettings.getValue().getId()).isEqualTo(PricingSettings.SINGLETON_ID);
        assertThat(savedSettings.getValue().getHomeLocality()).isEqualTo(SampleDataInitializer.SAMPLE_HOME_LOCALITY);

        verify(localityRepository).saveAll(savedLocalities.capture());
        assertThat(savedLocalities.getValue()).hasSize(SampleDataInitializer.SAMPLE_LOCALITIES.size());
    }

    @Test
    void conDatosYaConfigurados_noTocaNada() {
        setEnabled(true);
        when(hamTypeRepository.count()).thenReturn(2L);
        when(pricingSettingsRepository.count()).thenReturn(1L);

        initializer.run();

        verify(hamTypeRepository, never()).saveAll(anyList());
        verify(pricingSettingsRepository, never()).save(any());
        verify(localityRepository, never()).saveAll(anyList());
    }

    @Test
    void siElCortadorBorroTodasSusLocalidades_noReaparecenAlReiniciar() {
        // Un cortador que no se desplaza puede dejar la lista vacía a
        // propósito. Como ya tiene tarifas, no se vuelve a sembrar nada.
        setEnabled(true);
        when(hamTypeRepository.count()).thenReturn(3L);
        when(pricingSettingsRepository.count()).thenReturn(1L);

        initializer.run();

        verify(localityRepository, never()).count();
        verify(localityRepository, never()).saveAll(anyList());
    }

    @Test
    void desactivado_noHaceNadaNiConsultaLaBaseDeDatos() {
        setEnabled(false);

        initializer.run();

        verify(hamTypeRepository, never()).count();
        verify(pricingSettingsRepository, never()).count();
    }
}
