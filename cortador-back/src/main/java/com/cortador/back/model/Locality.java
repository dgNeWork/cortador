package com.cortador.back.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Localidad a la que el cortador se desplaza, con los kilómetros del
 * trayecto completo (ida y vuelta) desde su casa. Con esto se calcula el
 * desplazamiento sin depender de ningún servicio de mapas de pago.
 *
 * La localidad del propio cortador no va en esta tabla (está en
 * PricingSettings): allí el desplazamiento siempre es 0.
 */
@Entity
@Table(name = "localities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Locality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // Km del trayecto completo, ya sumando ida y vuelta.
    @Column(nullable = false)
    private Integer distanceKm;
}
