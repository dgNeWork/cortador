package com.cortador.back.availability;

import com.cortador.back.model.enums.SlotCoverage;

import java.time.LocalDate;

/**
 * Estado de un día del calendario y por qué está así.
 *
 * @param booked   lo que ocupan las reservas confirmadas de ese día
 * @param mark     la marca que el cortador puso a mano ese día (null si no hay)
 * @param blocked  lo que bloquea el cortador: su marca o, si no hay, sus reglas
 * @param occupied el resultado final (reservas + bloqueos): es lo único que ve el cliente
 */
public record DayAvailability(
        LocalDate date,
        SlotCoverage booked,
        SlotCoverage mark,
        SlotCoverage blocked,
        SlotCoverage occupied) {
}
