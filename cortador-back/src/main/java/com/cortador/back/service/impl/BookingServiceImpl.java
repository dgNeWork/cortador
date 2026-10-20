package com.cortador.back.service.impl;

import com.cortador.back.availability.AvailabilityService;
import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.exception.InvalidBookingStateException;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.exception.SlotUnavailableException;
import com.cortador.back.model.Booking;
import com.cortador.back.model.Customer;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.pricing.PriceBreakdown;
import com.cortador.back.pricing.Quote;
import com.cortador.back.pricing.QuoteService;
import com.cortador.back.repository.BookingRepository;
import com.cortador.back.service.BookingService;
import com.cortador.back.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    // Si una reserva está en uno de estos estados, ya es definitivo:
    // no se debe poder cambiar a otro estado después.
    private static final Set<BookingStatus> TERMINAL_STATUSES =
            EnumSet.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED);

    private final BookingRepository bookingRepository;
    private final CustomerService customerService;
    private final QuoteService quoteService;
    private final AvailabilityService availabilityService;

    @Override
    public Booking create(BookingRequest request) {
        // Lo primero, que la franja siga libre: ni reservada ni bloqueada por
        // el cortador (alguien puede haberla ocupado mientras el cliente
        // rellenaba el formulario). Si no, no seguimos.
        if (!availabilityService.isAvailableForRequest(request.getEventDate(), request.getTimeSlot())) {
            throw new SlotUnavailableException("Esa franja ya no está disponible ese día. Elige otro día u otra franja.");
        }

        // Después, el presupuesto: además de calcular el precio, comprueba
        // las reglas de negocio (jamón obligatorio en servicio completo,
        // jamón activo, localidad válida). Va antes de tocar al cliente
        // para no crear clientes a partir de reservas que se van a rechazar.
        Quote quote = quoteService.quote(request);
        PriceBreakdown price = quote.breakdown();

        // Buscamos el cliente por su email (o lo creamos si es la primera
        // vez); su ficha queda actualizada con el nombre y teléfono de ahora.
        Customer customer = customerService.findOrCreate(
                request.getCustomerName(), request.getCustomerEmail(), request.getCustomerPhone());

        Booking booking = Booking.builder()
                .customer(customer)
                // Copia del contacto de esta solicitud (ya sin espacios sobrantes).
                .customerName(customer.getName())
                .customerPhone(customer.getPhone())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .timeSlot(request.getTimeSlot())
                .estimatedDurationHours(request.getEstimatedDurationHours())
                .eventType(request.getEventType())
                .guestCount(request.getGuestCount())
                .location(request.getLocation())
                .serviceType(request.getServiceType())
                .hamType(quote.hamType())
                .notes(request.getNotes())
                // Copia del precio tal y como lo vio el cliente.
                .localityName(quote.localityName())
                .distanceKm(price.distanceKm())
                .serviceCost(price.serviceCost())
                .hamCost(price.hamCost())
                .travelCost(price.travelCost())
                .estimatedPrice(price.total())
                .build();

        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking findById(Long id) {
        // Si no existe, lanzamos un error 404 en vez de devolver null.
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna reserva con id " + id));
    }

    @Override
    public Booking updateStatus(Long id, BookingStatus newStatus) {
        Booking booking = findById(id);

        // No se puede cambiar el estado si ya está en uno definitivo
        // (CANCELLED o COMPLETED).
        if (TERMINAL_STATUSES.contains(booking.getStatus())) {
            String closedAs = booking.getStatus() == BookingStatus.CANCELLED ? "cancelada" : "completada";
            throw new InvalidBookingStateException(
                    "La reserva " + id + " ya está " + closedAs + " y no se puede cambiar de estado");
        }

        // Confirmar una reserva ocupa su franja: si ya hay otra confirmada
        // ese día en la misma franja, el cortador tendría dos eventos a la vez.
        if (newStatus == BookingStatus.CONFIRMED && availabilityService.isTakenByConfirmedBooking(
                booking.getEventDate(), booking.effectiveTimeSlot(), booking.getId())) {
            throw new InvalidBookingStateException("Ya tienes otra reserva confirmada ese día por la "
                    + booking.effectiveTimeSlot().getLabel() + ". Cancélala antes de confirmar esta.");
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking adjustPrice(Long id, BigDecimal finalPrice, String note) {
        Booking booking = findById(id);

        // Una reserva cancelada ya no se cobra: no tiene sentido cambiarle
        // el precio. Las completadas sí, por si al final hubo una hora más.
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException(
                    "La reserva " + id + " está cancelada y no se puede cambiar su precio");
        }

        booking.setFinalPrice(finalPrice.setScale(2, RoundingMode.HALF_UP));
        booking.setPriceNote(note.trim());
        return bookingRepository.save(booking);
    }
}
