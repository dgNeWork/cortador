package com.cortador.back.model;

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

import java.math.BigDecimal;

/**
 * Tipo de jamón que el cortador puede llevar en una reserva de tipo
 * FULL_SERVICE (por ejemplo Cebo, Cebo de Campo, Bellota), cada uno con
 * su precio. Es una tabla de la base de datos y no valores fijos en el
 * código, así se pueden cambiar los precios sin tocar el código.
 */
@Entity
@Table(name = "ham_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HamType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    private String description;

    // Usamos BigDecimal y no float/double: el dinero no debe tener los
    // errores de redondeo típicos de los números decimales normales.
    private BigDecimal price;
}
