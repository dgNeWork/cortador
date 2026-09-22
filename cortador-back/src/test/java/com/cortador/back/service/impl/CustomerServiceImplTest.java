package com.cortador.back.service.impl;

import com.cortador.back.model.Customer;
import com.cortador.back.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test unitario: prueba SOLO CustomerServiceImpl, sin base de datos real ni
 * Spring de por medio. El repositorio se sustituye por un "mock" (un doble
 * falso creado con Mockito) al que le decimos qué debe devolver cada método,
 * así podemos comprobar la lógica del servicio de forma aislada y rápida.
 *
 * @ExtendWith(MockitoExtension.class) le dice a JUnit que antes de cada test
 * cree los mocks marcados con @Mock e inyecte esos mocks en el objeto
 * marcado con @InjectMocks (ver BookingServiceImplTest para ese caso, aquí
 * se crea a mano en cada test porque solo hace falta un mock).
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @Test
    void findOrCreate_cuandoElEmailYaExiste_devuelveElClienteExistente() {
        // Arrange: preparamos el escenario. Le decimos al mock que, si le
        // preguntan por este email, actúe como si ya existiera en la BD.
        Customer existingCustomer = Customer.builder()
                .id(1L)
                .name("Ana García")
                .email("ana@example.com")
                .phone("600111222")
                .build();
        when(customerRepository.findByEmail("ana@example.com")).thenReturn(Optional.of(existingCustomer));

        CustomerServiceImpl customerService = new CustomerServiceImpl(customerRepository);

        // Act: ejecutamos el método que queremos probar.
        Customer result = customerService.findOrCreate("Ana García", "ana@example.com", "600111222");

        // Assert: comprobamos que el resultado es el esperado.
        assertThat(result).isEqualTo(existingCustomer);
        // Y comprobamos que NO se ha intentado crear un cliente nuevo,
        // porque ya existía uno con ese email.
        verify(customerRepository, never()).save(any());
    }

    @Test
    void findOrCreate_cuandoElEmailNoExiste_creaYGuardaUnClienteNuevo() {
        when(customerRepository.findByEmail("nuevo@example.com")).thenReturn(Optional.empty());
        // Cuando el servicio llame a save(...), el mock nos devuelve tal
        // cual el objeto que le hayan pasado (como haría una BD real, que
        // guarda y devuelve la misma entidad ya con id).
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CustomerServiceImpl customerService = new CustomerServiceImpl(customerRepository);

        Customer result = customerService.findOrCreate("Luis Pérez", "nuevo@example.com", "600333444");

        assertThat(result.getName()).isEqualTo("Luis Pérez");
        assertThat(result.getEmail()).isEqualTo("nuevo@example.com");
        assertThat(result.getPhone()).isEqualTo("600333444");
        verify(customerRepository).save(any(Customer.class));
    }
}
