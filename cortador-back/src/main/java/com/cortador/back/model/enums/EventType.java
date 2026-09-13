package com.cortador.back.model.enums;

/**
 * Tipo de evento para el que se hace la reserva.
 * Es una lista cerrada de opciones (enum) y no texto libre, para evitar
 * errores al escribir y poder filtrar reservas por tipo más adelante.
 */
public enum EventType {
    WEDDING,
    BIRTHDAY,
    CORPORATE,
    OTHER
}
