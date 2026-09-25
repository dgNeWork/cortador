package com.cortador.back.pricing;

import com.cortador.back.model.HamType;

/**
 * Presupuesto completo: el desglose del precio y los datos ya resueltos
 * con los que se ha calculado, para que la reserva pueda guardar una
 * copia de todo (así no cambia si el cortador modifica sus tarifas).
 *
 * @param hamType      jamón elegido, o null si el cliente pone el suyo
 * @param localityName nombre de la localidad del evento
 * @param breakdown    precio desglosado
 */
public record Quote(HamType hamType, String localityName, PriceBreakdown breakdown) {
}
