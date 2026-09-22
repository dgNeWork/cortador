package com.cortador.back.service.impl;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.exception.InvalidBookingStateException;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.Booking;
import com.cortador.back.model.Customer;
import com.cortador.back.model.HamType;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.EventType;
import com.cortador.back.model.enums.ServiceType;
import com.cortador.back.repository.BookingRepository;
import com.cortador.back.service.CustomerService;
import com.cortador.back.service.HamTypeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Aquí probamos las reglas de negocio de BookingServiceImpl, que es la
 * clase con más lógica de todo el backend. Usamos @Mock para las tres
 * dependencias (repositorio y los otros dos servicios) e @InjectMocks para
 * que Mockito construya BookingServiceImpl metiéndole esos tres mocks por
 * el constructor automáticamente (no hace falta escribir "new BookingServiceImpl(...)").
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private HamTypeService hamTypeService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = Customer.builder().id(1L).name("Ana García").email("ana@example.com").phone("600111222").build();
    }

    private BookingRequest buildValidRequest(ServiceType serviceType, Long hamTypeId) {
        BookingRequest request = new BookingRequest();
        request.setCustomerName(customer.getName());
        request.setCustomerEmail(customer.getEmail());
        request.setCustomerPhone(customer.getPhone());
        request.setEventDate(LocalDate.now().plusDays(30));
        request.setEventTime(LocalTime.of(13, 0));
        request.setEstimatedDurationHours(2);
        request.setEventType(EventType.WEDDING);
        request.setGuestCount(80);
        request.setLocation("Finca El Olivar");
        request.setServiceType(serviceType);
        request.setHamTypeId(hamTypeId);
        return request;
    }

    @Test
    void create_servicioCompletoSinJamonElegido_lanzaIllegalArgumentException() {
        BookingRequest request = buildValidRequest(ServiceType.FULL_SERVICE, null);

        // No hace falta preparar ningún mock: la regla se comprueba antes
        // de tocar el cliente o el repositorio, así que ni deberían llamarse.
        assertThatThrownBy(() -> bookingService.create(request))
                .isInstanceOf(IllegalArgumentException.class);

        verify(customerService, never()).findOrCreate(any(), any(), any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_soloCorteSinJamon_creaLaReservaSinTipoDeJamon() {
        BookingRequest request = buildValidRequest(ServiceType.CUT_ONLY, null);
        when(customerService.findOrCreate(customer.getName(), customer.getEmail(), customer.getPhone()))
                .thenReturn(customer);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.create(request);

        assertThat(result.getCustomer()).isEqualTo(customer);
        assertThat(result.getHamType()).isNull();
        assertThat(result.getServiceType()).isEqualTo(ServiceType.CUT_ONLY);
        // No se debe consultar el catálogo de jamones si no hace falta.
        verify(hamTypeService, never()).findById(any());
    }

    @Test
    void create_servicioCompletoConJamonElegido_creaLaReservaConEseJamon() {
        HamType bellota = HamType.builder().id(2L).name("Bellota").build();
        BookingRequest request = buildValidRequest(ServiceType.FULL_SERVICE, 2L);
        when(customerService.findOrCreate(customer.getName(), customer.getEmail(), customer.getPhone()))
                .thenReturn(customer);
        when(hamTypeService.findById(2L)).thenReturn(bellota);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.create(request);

        assertThat(result.getHamType()).isEqualTo(bellota);
    }

    @Test
    void findById_cuandoNoExisteLaReserva_lanzaResourceNotFoundException() {
        when(bookingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.findById(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatus_reservaYaCancelada_lanzaInvalidBookingStateExceptionYNoLaGuarda() {
        Booking cancelledBooking = Booking.builder().id(5L).status(BookingStatus.CANCELLED).build();
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(cancelledBooking));

        assertThatThrownBy(() -> bookingService.updateStatus(5L, BookingStatus.CONFIRMED))
                .isInstanceOf(InvalidBookingStateException.class);

        // Regla clave: un estado terminal no se puede pisar, así que save()
        // no debería llegar a llamarse nunca en este caso.
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void updateStatus_reservaPendiente_cambiaAConfirmedYLaGuarda() {
        Booking pendingBooking = Booking.builder().id(6L).status(BookingStatus.PENDING).build();
        when(bookingRepository.findById(6L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.updateStatus(6L, BookingStatus.CONFIRMED);

        assertThat(result.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository).save(pendingBooking);
    }
}
