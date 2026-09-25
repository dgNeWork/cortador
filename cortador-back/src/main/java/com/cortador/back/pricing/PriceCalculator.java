package com.cortador.back.pricing;

import com.cortador.back.model.HamType;
import com.cortador.back.model.PricingSettings;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * LA FÓRMULA DEL PRECIO ESTÁ AQUÍ Y SOLO AQUÍ. Si un cortador quiere
 * calcularlo de otra forma (un mínimo de horas, un recargo de noche...),
 * este es el único sitio que hay que cambiar.
 *
 *   total = horas x €/hora  +  precio del jamón  +  km x €/km
 *
 * No consulta la base de datos ni nada externo: recibe todos los datos ya
 * resueltos y solo hace cuentas. Por eso se puede probar con tests muy
 * simples, sin mocks.
 */
@Component
public class PriceCalculator {

    /**
     * @param settings   tarifas del cortador, o null si todavía no las ha configurado
     * @param hours      horas de servicio
     * @param hamType    jamón elegido, o null si el cliente pone el suyo
     * @param distanceKm km del trayecto completo, 0 en casa del cortador, o
     *                   null si la localidad no está en la lista
     */
    public PriceBreakdown calculate(PricingSettings settings, int hours, HamType hamType, Integer distanceKm) {
        BigDecimal hamCost = hamType != null ? money(hamType.getPrice()) : null;

        // Sin tarifas no se puede calcular ni el servicio ni el
        // desplazamiento: todo queda "a consultar" (salvo el jamón).
        if (settings == null) {
            return new PriceBreakdown(null, hours, null, hamCost, null, distanceKm, null, null, true);
        }

        BigDecimal serviceCost = money(settings.getHourlyRate().multiply(BigDecimal.valueOf(hours)));
        BigDecimal travelCost = distanceKm != null
                ? money(settings.getPricePerKm().multiply(BigDecimal.valueOf(distanceKm)))
                : null;

        boolean onRequest = travelCost == null;
        BigDecimal total = onRequest ? null : serviceCost.add(travelCost).add(hamCost != null ? hamCost : BigDecimal.ZERO);

        return new PriceBreakdown(settings.getHourlyRate(), hours, serviceCost, hamCost,
                settings.getPricePerKm(), distanceKm, travelCost, total, onRequest);
    }

    // Redondeo a céntimos "de toda la vida" (0,005 sube a 0,01).
    private static BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
