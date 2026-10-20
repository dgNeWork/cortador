package com.cortador.back.model.enums;

/**
 * Qué parte de un día está ocupada: nada, una de las dos franjas o el día
 * entero. Se usa para las marcas del calendario, para las reglas
 * habituales del cortador y para el resultado final de cada día.
 */
public enum SlotCoverage {
    NONE,
    MIDDAY,
    EVENING,
    FULL_DAY;

    // Indica si esta ocupación incluye la franja dada.
    public boolean covers(TimeSlot slot) {
        return switch (this) {
            case NONE -> false;
            case FULL_DAY -> true;
            case MIDDAY -> slot == TimeSlot.MIDDAY;
            case EVENING -> slot == TimeSlot.EVENING;
        };
    }

    // Junta dos ocupaciones del mismo día: por ejemplo, una reserva por la
    // mañana/tarde y una marca de tarde/noche dan el día completo.
    public SlotCoverage plus(SlotCoverage other) {
        return of(covers(TimeSlot.MIDDAY) || other.covers(TimeSlot.MIDDAY),
                covers(TimeSlot.EVENING) || other.covers(TimeSlot.EVENING));
    }

    // Ocupación que corresponde a una sola franja.
    public static SlotCoverage of(TimeSlot slot) {
        return slot == TimeSlot.MIDDAY ? MIDDAY : EVENING;
    }

    private static SlotCoverage of(boolean midday, boolean evening) {
        if (midday && evening) {
            return FULL_DAY;
        }
        if (midday) {
            return MIDDAY;
        }
        return evening ? EVENING : NONE;
    }
}
