package com.cortador.back.dto.response;

import com.cortador.back.model.Locality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Datos de una localidad que se devuelven al frontend.
 */
@Getter
@Builder
@AllArgsConstructor
public class LocalityResponse {
    private Long id;
    private String name;
    private Integer distanceKm;

    public static LocalityResponse from(Locality locality) {
        return LocalityResponse.builder()
                .id(locality.getId())
                .name(locality.getName())
                .distanceKm(locality.getDistanceKm())
                .build();
    }
}
