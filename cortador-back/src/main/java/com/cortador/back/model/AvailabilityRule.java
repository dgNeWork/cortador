package com.cortador.back.model;

import com.cortador.back.model.enums.SlotCoverage;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.Set;

/**
 * Regla habitual de no disponibilidad del cortador, por ejemplo "de lunes
 * a viernes, día completo ocupado" porque esos días trabaja en otra cosa.
 * Se pinta sola en el calendario en todos los días que encajan.
 *
 * Las fechas de inicio y fin son opcionales: sin ellas la regla vale para
 * siempre; con ellas, solo en ese periodo (por ejemplo, de noviembre a junio).
 */
@Entity
@Table(name = "availability_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AvailabilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Días de la semana a los que se aplica. Se guardan en una tabla
    // aparte (una fila por día) y se cargan siempre junto con la regla,
    // porque sin ellos la regla no sirve para nada.
    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "availability_rule_days", joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private Set<DayOfWeek> daysOfWeek = EnumSet.noneOf(DayOfWeek.class);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotCoverage coverage;

    // null = sin límite por ese lado.
    private LocalDate startDate;

    private LocalDate endDate;

    // Indica si la regla se aplica a esa fecha (día de la semana y periodo).
    public boolean appliesTo(LocalDate date) {
        return daysOfWeek.contains(date.getDayOfWeek())
                && (startDate == null || !date.isBefore(startDate))
                && (endDate == null || !date.isAfter(endDate));
    }
}
