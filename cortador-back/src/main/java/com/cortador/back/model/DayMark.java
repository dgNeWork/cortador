package com.cortador.back.model;

import com.cortador.back.model.enums.SlotCoverage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDate;

/**
 * Marca que el cortador pone a mano en un día concreto del calendario
 * (por ejemplo, "el 14 de noviembre, tarde/noche ocupada").
 *
 * Una marca manda sobre las reglas habituales de ese día: una marca NONE
 * deja libre un día que una regla ocupaba (un lunes que, por excepción,
 * sí puede trabajar). Las reservas confirmadas ocupan su franja siempre,
 * haya marca o no.
 */
@Entity
@Table(name = "day_marks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DayMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Un día solo puede tener una marca.
    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotCoverage coverage;
}
