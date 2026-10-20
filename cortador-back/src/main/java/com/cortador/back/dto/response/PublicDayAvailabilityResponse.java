package com.cortador.back.dto.response;

import com.cortador.back.availability.DayAvailability;
import com.cortador.back.model.enums.SlotCoverage;

import java.time.LocalDate;

/**
 * Lo que ve el cliente de un día del calendario: solo qué está ocupado.
 * Ni de quién son las reservas ni por qué está bloqueado.
 */
public record PublicDayAvailabilityResponse(LocalDate date, SlotCoverage occupied) {

    public static PublicDayAvailabilityResponse from(DayAvailability day) {
        return new PublicDayAvailabilityResponse(day.date(), day.occupied());
    }
}
