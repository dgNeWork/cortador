package com.cortador.back.model;

import com.cortador.back.model.enums.BookingStatus;
import com.cortador.back.model.enums.EventType;
import com.cortador.back.model.enums.ServiceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Una solicitud de corte para un evento. Es la clase más importante de
 * toda la aplicación: el resto (Customer, HamType) existe para apoyarla.
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"customer", "hamType"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // LAZY: los datos del cliente solo se cargan cuando se piden de verdad,
    // no cada vez que se consulta una lista de reservas.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private LocalTime eventTime;

    @Column(nullable = false)
    private Integer estimatedDurationHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;

    // Solo tiene sentido si serviceType = FULL_SERVICE; si es CUT_ONLY
    // (el cliente pone su propio jamón), este campo se queda vacío (null).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ham_type_id")
    private HamType hamType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    // ---- Precio ----
    // Copia de la localidad y del desglose en el momento de reservar: si
    // el cortador cambia después sus tarifas o borra la localidad, esta
    // reserva sigue mostrando lo que se le dijo al cliente.

    // Localidad del evento (la del cortador, una de su lista u otra que
    // escribió el cliente).
    private String localityName;

    // Km del trayecto completo; null si la localidad no estaba en la lista.
    private Integer distanceKm;

    private BigDecimal serviceCost;

    private BigDecimal hamCost;

    private BigDecimal travelCost;

    // Total calculado automáticamente; null si era "a consultar".
    private BigDecimal estimatedPrice;

    // Precio que fija el cortador a mano (descuento, lo hablado por
    // teléfono...). Si es null, vale el calculado.
    private BigDecimal finalPrice;

    // Motivo del ajuste de precio, para que quede constancia.
    private String priceNote;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Se ejecuta justo antes de guardar la reserva por primera vez.
     * Toda reserva nueva empieza en estado PENDING y guarda su fecha de
     * creación en automático - esto no se debe poner nunca a mano.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
    }
}
