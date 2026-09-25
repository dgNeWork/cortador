package com.cortador.back.dto.response;

import com.cortador.back.pricing.PriceBreakdown;
import com.cortador.back.pricing.Quote;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Presupuesto que ve el cliente en el formulario de reserva, desglosado.
 * Los importes que no se pueden calcular van a null y onRequest = true
 * ("a consultar").
 */
@Getter
@Builder
@AllArgsConstructor
public class QuoteResponse {
    private String localityName;
    private Integer hours;
    private BigDecimal hourlyRate;
    private BigDecimal serviceCost;
    private String hamTypeName;
    private BigDecimal hamCost;
    private Integer distanceKm;
    private BigDecimal pricePerKm;
    private BigDecimal travelCost;
    private BigDecimal total;
    private boolean onRequest;

    public static QuoteResponse from(Quote quote) {
        PriceBreakdown price = quote.breakdown();
        return QuoteResponse.builder()
                .localityName(quote.localityName())
                .hours(price.hours())
                .hourlyRate(price.hourlyRate())
                .serviceCost(price.serviceCost())
                .hamTypeName(quote.hamType() != null ? quote.hamType().getName() : null)
                .hamCost(price.hamCost())
                .distanceKm(price.distanceKm())
                .pricePerKm(price.pricePerKm())
                .travelCost(price.travelCost())
                .total(price.total())
                .onRequest(price.onRequest())
                .build();
    }
}
