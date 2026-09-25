package com.cortador.back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Lo que necesita el desplegable "Localidad del evento" del formulario:
 * la localidad del cortador (sin desplazamiento, va la primera) y su lista
 * de localidades. homeLocality es null si aún no ha configurado sus tarifas.
 */
@Getter
@AllArgsConstructor
public class PublicLocalitiesResponse {
    private String homeLocality;
    private List<LocalityResponse> localities;
}
