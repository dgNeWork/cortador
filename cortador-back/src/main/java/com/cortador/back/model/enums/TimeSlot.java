package com.cortador.back.model.enums;

import java.time.LocalTime;

/**
 * Franja del día en la que es el evento. El cortador puede hacer dos
 * eventos el mismo día (el aperitivo de una boda de mediodía y la
 * llegada de invitados de una boda de tarde), así que la disponibilidad
 * se cuenta por franjas y no por días enteros.
 * El cliente ve solo el nombre de la franja, sin horas.
 */
public enum TimeSlot {
    MIDDAY("mañana/tarde"),
    EVENING("tarde/noche");

    // Hora a partir de la cual un evento se considera de tarde/noche. Solo
    // se usa para las reservas antiguas que se crearon sin franja.
    private static final LocalTime EVENING_FROM = LocalTime.of(17, 0);

    // Nombre en español para los mensajes de error y los correos.
    private final String label;

    TimeSlot(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // Deduce la franja a partir de la hora del evento (antes de las 17:00,
    // mañana/tarde). Para las reservas que no guardaban la franja.
    public static TimeSlot fromEventTime(LocalTime eventTime) {
        return eventTime.isBefore(EVENING_FROM) ? MIDDAY : EVENING;
    }
}
