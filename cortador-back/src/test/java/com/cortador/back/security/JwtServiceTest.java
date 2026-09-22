package com.cortador.back.security;

import com.cortador.back.model.User;
import com.cortador.back.model.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.SecureRandom;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * JwtService no tiene dependencias externas (no usa el repositorio ni nada
 * de Spring en tiempo de ejecución), así que no hace falta Mockito ni
 * levantar el contexto de Spring: se prueba como una clase Java normal.
 *
 * El único truco es que "secret" y "expirationMs" normalmente los rellena
 * Spring solo, leyendo application.properties (@Value). Aquí no hay Spring,
 * así que usamos ReflectionTestUtils para meter esos valores a mano
 * directamente en los campos privados, simulando lo que haría Spring.
 */
class JwtServiceTest {

    private JwtService jwtService;
    private User adminUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Clave secreta de prueba: 32 bytes aleatorios en Base64, el
        // formato mínimo que exige el algoritmo de firma HS256.
        byte[] randomKey = new byte[32];
        new SecureRandom().nextBytes(randomKey);
        String testSecret = Base64.getEncoder().encodeToString(randomKey);

        ReflectionTestUtils.setField(jwtService, "secret", testSecret);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);

        adminUser = User.builder().id(1L).email("admin@cortadorpro.example").role(Role.ADMIN).build();
    }

    @Test
    void generateToken_yLuegoExtractEmail_devuelveElEmailOriginal() {
        String token = jwtService.generateToken(adminUser);

        String extractedEmail = jwtService.extractEmail(token);

        assertThat(extractedEmail).isEqualTo("admin@cortadorpro.example");
    }

    @Test
    void isValid_conUnTokenReciénGenerado_devuelveTrue() {
        String token = jwtService.generateToken(adminUser);

        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void isValid_conUnTokenManipulado_devuelveFalse() {
        String token = jwtService.generateToken(adminUser);
        // Cambiamos el último carácter de la firma: el token deja de
        // coincidir con lo que se firmó, así que debe rechazarse.
        String tamperedToken = token.substring(0, token.length() - 1) + "X";

        assertThat(jwtService.isValid(tamperedToken)).isFalse();
    }

    @Test
    void isValid_conUnTokenYaCaducado_devuelveFalse() {
        // Ponemos una caducidad negativa: el token nace caducado, así no
        // hace falta esperar de verdad para probar este caso.
        ReflectionTestUtils.setField(jwtService, "expirationMs", -1_000L);
        String expiredToken = jwtService.generateToken(adminUser);

        assertThat(jwtService.isValid(expiredToken)).isFalse();
    }
}
