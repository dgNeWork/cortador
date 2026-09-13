package com.cortador.back.service.impl;

import com.cortador.back.dto.request.BookingRequest;
import com.cortador.back.exception.InvalidBookingStateException;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.Booking;
import com.cortador.back.model.Customer;
import com.cortador.back.model.HamType;
import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.ServiceType;
import com.cortador.back.repository.BookingRepository;
import com.cortador.back.service.BookingService;
import com.cortador.back.service.CustomerService;
import com.cortador.back.service.HamTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    private final HamTypeService hamTypeService;

    @Override
    public Booking create(BookingRequest request) {
        // Regla de negocio: si el servicio es completo, hace falta elegir un jamón.
        if (request.getServiceType() == ServiceType.FULL_SERVICE && request.getHamTypeId() == null) {
            throw new IllegalArgumentException("A ham type must be selected for a full-service booking");
        }

        // Buscamos el cliente por su email, o lo creamos si es la primera vez.
        Customer customer = customerService.findOrCreate(
                request.getCustomerName(), request.getCustomerEmail(), request.getCustomerPhone());

        // Si el cliente eligió un jamón, lo buscamos en la base de datos.
        // Si no (corte solo), la reserva se queda sin jamón asociado.
        HamType hamType = request.getHamTypeId() != null
                ? hamTypeService.findById(request.getHamTypeId())
                : null;

        Booking booking = Booking.builder()
                .customer(customer)
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .estimatedDurationHours(request.getEstimatedDurationHours())
                .eventType(request.getEventType())
                .guestCount(request.getGuestCount())
                .location(request.getLocation())
                .serviceType(request.getServiceType())
                .hamType(hamType)
                .notes(request.getNotes())
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
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + id));
    }

    @Override
    public Booking updateStatus(Long id, BookingStatus newStatus) {
        Booking booking = findById(id);

        // No se puede cambiar el estado si ya está en uno definitivo
        // (CANCELLED o COMPLETED).
        if (TERMINAL_STATUSES.contains(booking.getStatus())) {
            throw new InvalidBookingStateException(
                    "Booking " + id + " is already " + booking.getStatus() + " and cannot change status");
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }
}
