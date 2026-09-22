package com.cortador.back.service.impl;

import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.HamType;
import com.cortador.back.repository.HamTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HamTypeServiceImplTest {

    @Mock
    private HamTypeRepository hamTypeRepository;

    @Test
    void findById_cuandoElIdExiste_devuelveElTipoDeJamon() {
        HamType bellota = HamType.builder()
                .id(2L)
                .name("Bellota")
                .price(new BigDecimal("350.00"))
                .build();
        when(hamTypeRepository.findById(2L)).thenReturn(Optional.of(bellota));

        HamTypeServiceImpl hamTypeService = new HamTypeServiceImpl(hamTypeRepository);

        HamType result = hamTypeService.findById(2L);

        assertThat(result).isEqualTo(bellota);
    }

    @Test
    void findById_cuandoElIdNoExiste_lanzaResourceNotFoundException() {
        when(hamTypeRepository.findById(99L)).thenReturn(Optional.empty());

        HamTypeServiceImpl hamTypeService = new HamTypeServiceImpl(hamTypeRepository);

        // assertThatThrownBy ejecuta el código y comprueba que lanza la
        // excepción esperada, en vez de tener que envolverlo en try/catch
        // a mano. Así el test falla con un mensaje claro si no la lanza.
        assertThatThrownBy(() -> hamTypeService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
