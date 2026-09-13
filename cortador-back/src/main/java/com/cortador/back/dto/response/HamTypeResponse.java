package com.cortador.back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Datos de un HamType que se devuelven al frontend, para mostrar las
 * opciones de jamón que el cliente puede elegir al reservar.
 */
@Getter
@Builder
@AllArgsConstructor
public class HamTypeResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
}
