package com.cortador.back.dto.response;

import com.cortador.back.model.HamType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Datos de un HamType que se devuelven al frontend: al formulario de
 * reserva (solo los activos) y al panel del cortador (todos).
 */
@Getter
@Builder
@AllArgsConstructor
public class HamTypeResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;

    // Convierte la entidad en este DTO. Está aquí y no en cada controlador
    // porque lo usan dos (el público y el del panel).
    public static HamTypeResponse from(HamType hamType) {
        return HamTypeResponse.builder()
                .id(hamType.getId())
                .name(hamType.getName())
                .description(hamType.getDescription())
                .price(hamType.getPrice())
                .active(hamType.isActive())
                .build();
    }
}
