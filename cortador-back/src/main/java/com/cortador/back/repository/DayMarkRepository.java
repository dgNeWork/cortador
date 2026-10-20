package com.cortador.back.repository;

import com.cortador.back.model.DayMark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Acceso a las marcas que el cortador pone en días concretos del calendario.
 */
public interface DayMarkRepository extends JpaRepository<DayMark, Long> {

    Optional<DayMark> findByDate(LocalDate date);

    // Marcas de un periodo, para pintar un mes (o varios) del calendario.
    List<DayMark> findByDateBetween(LocalDate from, LocalDate to);
}
