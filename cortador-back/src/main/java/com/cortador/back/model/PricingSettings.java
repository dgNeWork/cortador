package com.cortador.back.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Tarifas del cortador: lo que cobra por hora de corte, lo que cobra por
 * kilómetro de desplazamiento y cuál es su localidad ("casa", donde no
 * cobra desplazamiento).
 *
 * Solo existe una fila en esta tabla (es un único cortador), siempre con
 * el mismo id. Por eso el id no se genera solo: se fija a SINGLETON_ID.
 */
@Entity
@Table(name = "pricing_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingSettings {

    public static final Long SINGLETON_ID = 1L;

    @Id
    @Builder.Default
    private Long id = SINGLETON_ID;

    @Column(nullable = false)
    private BigDecimal hourlyRate;

    // Se multiplica por los km del trayecto completo (ida y vuelta) que
    // el cortador apunta en cada localidad.
    @Column(nullable = false)
    private BigDecimal pricePerKm;

    @Column(nullable = false)
    private String homeLocality;
}
