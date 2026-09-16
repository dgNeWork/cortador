package com.cortador.back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Lo que recibe el frontend tras un login correcto: el token JWT que debe
 * mandar en cada petición al panel de admin, más el email para poder
 * mostrarlo en la interfaz sin decodificar el token en el cliente.
 */
@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
}
