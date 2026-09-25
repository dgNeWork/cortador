package com.cortador.back.pricing;

import java.math.BigDecimal;

/**
 * Resultado del cálculo de precio, desglosado para enseñárselo al cliente.
 *
 * Cualquier parte que no se pueda calcular va a null (por ejemplo, el
 * desplazamiento a una localidad que no está en la lista). En ese caso el
 * total también es null y onRequest = true: el precio es "a consultar".
 *
 * @param hourlyRate  €/hora con el que se ha calculado el servicio
 * @param hours       horas de servicio
 * @param serviceCost horas x €/hora
 * @param hamCost     precio del jamón (null si el cliente pone el suyo)
 * @param pricePerKm  €/km con el que se ha calculado el desplazamiento
 * @param distanceKm  km del trayecto completo (0 en la localidad del cortador)
 * @param travelCost  km x €/km
 * @param total       suma de todo, o null si algo es "a consultar"
 * @param onRequest   true si el precio final lo tiene que dar el cortador
 */
public record PriceBreakdown(
        BigDecimal hourlyRate,
        int hours,
        BigDecimal serviceCost,
        BigDecimal hamCost,
        BigDecimal pricePerKm,
        Integer distanceKm,
        BigDecimal travelCost,
        BigDecimal total,
        boolean onRequest) {
}
