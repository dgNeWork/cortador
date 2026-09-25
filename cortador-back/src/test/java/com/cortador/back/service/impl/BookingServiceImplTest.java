package com.cortador.back.service.impl;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.exception.InvalidBookingStateException;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.Booking;
import com.cortador.back.model.Customer;
import com.cortador.back.model.HamType;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.EventType;
import com.cortador.back.model.enums.LocalityOption;
import com.cortador.back.model.enums.ServiceType;
import com.cortador.back.pricing.PriceBreakdown;
import com.cortador.back.pricing.Quote;
import com.cortador.back.pricing.QuoteService;
import com.cortador.back.repository.BookingRepository;
import com.cortador.back.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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
 * Aquí probamos las reglas de BookingServiceImpl. Usamos @Mock para sus
 * tres dependencias (repositorio, clientes y presupuestos) e @InjectMocks
 * para que Mockito construya BookingServiceImpl metiéndole esos mocks por
 * el constructor automáticamente (no hace falta escribir "new BookingServiceImpl(...)").
 *
 * Las reglas del precio y del jamón se prueban en QuoteServiceTest y
 * PriceCalculatorTest: aquí el presupuesto es un mock y solo comprobamos
 * qué hace la reserva con él.
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private QuoteService quoteService;

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
        request.setLocalityOption(LocalityOption.LISTED);
        request.setLocalityId(4L);
        return request;
    }

    @Test
    void create_siElPresupuestoRechazaLosDatos_noCreaNiElClienteNiLaReserva() {
        BookingRequest request = buildValidRequest(ServiceType.FULL_SERVICE, null);
        when(quoteService.quote(request))
                .thenThrow(new IllegalArgumentException("Para el servicio completo hay que elegir un jamón"));

        assertThatThrownBy(() -> bookingService.create(request))
                .isInstanceOf(IllegalArgumentException.class);

        verify(customerService, never()).findOrCreate(any(), any(), any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_guardaUnaCopiaDelJamonYDelPrecioDesglosado() {
        BookingRequest request = buildValidRequest(ServiceType.FULL_SERVICE, 2L);
        HamType bellota = HamType.builder().id(2L).name("Bellota").price(new BigDecimal("390.00")).build();
        PriceBreakdown price = new PriceBreakdown(new BigDecimal("50.00"), 2, new BigDecimal("100.00"),
                new BigDecimal("390.00"), new BigDecimal("0.40"), 70, new BigDecimal("28.00"),
                new BigDecimal("518.00"), false);
        when(quoteService.quote(request)).thenReturn(new Quote(bellota, "Cádiz", price));
        when(customerService.findOrCreate(customer.getName(), customer.getEmail(), customer.getPhone()))
                .thenReturn(customer);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.create(request);

        assertThat(result.getCustomer()).isEqualTo(customer);
        assertThat(result.getHamType()).isEqualTo(bellota);
        assertThat(result.getLocalityName()).isEqualTo("Cádiz");
        assertThat(result.getDistanceKm()).isEqualTo(70);
        assertThat(result.getTravelCost()).isEqualByComparingTo("28.00");
        assertThat(result.getEstimatedPrice()).isEqualByComparingTo("518.00");
        // El precio final solo lo pone el cortador a mano.
        assertThat(result.getFinalPrice()).isNull();
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
                .isInstanceOf(InvalidBookingStateException.class)
                .hasMessageContaining("cancelada");

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

    @Test
    void adjustPrice_guardaElPrecioFinalYElMotivoSinTocarElCalculado() {
        Booking booking = Booking.builder().id(7L).status(BookingStatus.PENDING)
                .estimatedPrice(new BigDecimal("518.00")).build();
        when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.adjustPrice(7L, new BigDecimal("480"), "  Descuento por cliente habitual ");

        assertThat(result.getFinalPrice()).isEqualByComparingTo("480.00");
        assertThat(result.getFinalPrice().scale()).isEqualTo(2);
        assertThat(result.getPriceNote()).isEqualTo("Descuento por cliente habitual");
        assertThat(result.getEstimatedPrice()).isEqualByComparingTo("518.00");
    }

    @Test
    void adjustPrice_reservaCancelada_lanzaInvalidBookingStateExceptionYNoLaGuarda() {
        Booking cancelled = Booking.builder().id(8L).status(BookingStatus.CANCELLED).build();
        when(bookingRepository.findById(8L)).thenReturn(Optional.of(cancelled));
        BigDecimal newPrice = new BigDecimal("100");

        assertThatThrownBy(() -> bookingService.adjustPrice(8L, newPrice, "Motivo"))
                .isInstanceOf(InvalidBookingStateException.class);

        verify(bookingRepository, never()).save(any());
    }
}
