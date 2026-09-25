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
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

/**
 * Tipo de jamón que el cortador puede llevar en una reserva de tipo
 * FULL_SERVICE (por ejemplo Cebo, Cebo de Campo, Bellota), cada uno con
 * su precio. Es una tabla de la base de datos y no valores fijos en el
 * código, así el cortador puede cambiar su catálogo desde el panel.
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

    // Un jamón desactivado deja de salir en el formulario de reserva, pero
    // no se borra: las reservas antiguas que lo usan siguen apuntando a él.
    // @ColumnDefault hace que, al añadir esta columna a una tabla que ya
    // tiene filas, esas filas queden como activas en vez de dar error.
    @Builder.Default
    @ColumnDefault("true")
    @Column(nullable = false)
    private boolean active = true;
}
