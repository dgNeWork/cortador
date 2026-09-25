package com.cortador.back.service.impl;

import com.cortador.back.dto.request.HamTypeRequest;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.HamType;
import com.cortador.back.repository.HamTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HamTypeServiceImplTest {

    @Mock
    private HamTypeRepository hamTypeRepository;

    private HamTypeServiceImpl hamTypeService;

    @BeforeEach
    void setUp() {
        hamTypeService = new HamTypeServiceImpl(hamTypeRepository);
    }

    // Crea el DTO que mandaría el panel del cortador.
    private HamTypeRequest buildRequest(String name, String price, Boolean active) {
        HamTypeRequest request = new HamTypeRequest();
        request.setName(name);
        request.setDescription("Pieza de 7-8 kg");
        request.setPrice(new BigDecimal(price));
        request.setActive(active);
        return request;
    }

    @Test
    void findById_cuandoElIdExiste_devuelveElTipoDeJamon() {
        HamType bellota = HamType.builder()
                .id(2L)
                .name("Bellota")
                .price(new BigDecimal("350.00"))
                .build();
        when(hamTypeRepository.findById(2L)).thenReturn(Optional.of(bellota));

        HamType result = hamTypeService.findById(2L);

        assertThat(result).isEqualTo(bellota);
    }

    @Test
    void findById_cuandoElIdNoExiste_lanzaResourceNotFoundException() {
        when(hamTypeRepository.findById(99L)).thenReturn(Optional.empty());

        // assertThatThrownBy ejecuta el código y comprueba que lanza la
        // excepción esperada, en vez de tener que envolverlo en try/catch
        // a mano. Así el test falla con un mensaje claro si no la lanza.
        assertThatThrownBy(() -> hamTypeService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findAllActive_devuelveSoloLoQueDaLaConsultaDeActivos() {
        HamType cebo = HamType.builder().id(1L).name("Cebo").build();
        when(hamTypeRepository.findAllByActiveTrueOrderByPriceAsc()).thenReturn(List.of(cebo));

        assertThat(hamTypeService.findAllActive()).containsExactly(cebo);
    }

    @Test
    void create_sinIndicarActive_guardaElJamonActivoYConElNombreSinEspaciosSobrantes() {
        // thenAnswer devuelve el mismo objeto que se le pasa a save(), como
        // haría la base de datos, para poder comprobar qué se guardó.
        when(hamTypeRepository.save(any(HamType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HamType result = hamTypeService.create(buildRequest("  Bellota  ", "390.00", null));

        assertThat(result.getName()).isEqualTo("Bellota");
        assertThat(result.getPrice()).isEqualByComparingTo("390.00");
        assertThat(result.isActive()).isTrue();
    }

    @Test
    void update_cambiaLosDatosYPuedeDesactivarElJamon() {
        HamType existing = HamType.builder().id(4L).name("Cebo").price(new BigDecimal("180.00")).build();
        when(hamTypeRepository.findById(4L)).thenReturn(Optional.of(existing));
        when(hamTypeRepository.save(any(HamType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HamType result = hamTypeService.update(4L, buildRequest("Cebo de campo", "240.00", false));

        assertThat(result.getName()).isEqualTo("Cebo de campo");
        assertThat(result.getPrice()).isEqualByComparingTo("240.00");
        assertThat(result.isActive()).isFalse();
    }

    @Test
    void update_cuandoElJamonNoExiste_lanzaResourceNotFoundExceptionYNoGuardaNada() {
        when(hamTypeRepository.findById(99L)).thenReturn(Optional.empty());
        HamTypeRequest request = buildRequest("Cebo", "180.00", true);

        assertThatThrownBy(() -> hamTypeService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(hamTypeRepository, never()).save(any());
    }
}
