package com.cortador.back.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Persona que pide el servicio de corte. El cliente no tiene login (el
 * formulario es público), así que esta clase solo sirve para no repetir
 * sus datos de contacto cada vez que hace una reserva nueva.
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// La igualdad se comprueba solo por el id: dos objetos son "el mismo" solo
// si tienen el mismo id en la base de datos, no si todos los campos coinciden.
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// No incluimos "bookings" en el toString, para no disparar carga perezosa
// (lazy loading) ni entrar en un bucle infinito (Booking -> Customer -> Bookings -> ...).
@ToString(exclude = "bookings")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    private String email;

    private String phone;

    @Builder.Default
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();
}
