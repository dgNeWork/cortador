package com.cortador.back.dto.request;

import com.cortador.back.model.enums.LocalityOption;
import com.cortador.back.model.enums.ServiceType;

/**
 * Los datos de los que depende el precio. Los tienen tanto la petición de
 * presupuesto (QuoteRequest) como la reserva completa (BookingRequest), y
 * así QuoteService puede calcular el precio de cualquiera de las dos sin
 * tener que distinguirlas.
 */
public interface PricingInput {

    Integer getEstimatedDurationHours();

    ServiceType getServiceType();

    Long getHamTypeId();

    LocalityOption getLocalityOption();

    // Solo si localityOption = LISTED.
    Long getLocalityId();

    // Solo si localityOption = OTHER: la localidad que escribe el cliente.
    String getOtherLocalityName();
}
