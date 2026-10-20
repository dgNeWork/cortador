package com.cortador.back.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * El 403 (sesión iniciada pero sin permiso) no se puede provocar con una
 * petición real porque de momento solo existe el rol ADMIN, que puede
 * con todo. Por eso se prueba el manejador directamente: se le pasa una
 * petición y una respuesta "falsas" de Spring (MockHttpServletRequest y
 * MockHttpServletResponse) y se mira qué ha escrito en la respuesta.
 */
class RestAccessDeniedHandlerTest {

    @Test
    void respondeCon403YElErrorEnJsonConMensajeEnEspanol() throws Exception {
        RestAccessDeniedHandler handler = new RestAccessDeniedHandler(JsonMapper.builder().build());
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.handle(new MockHttpServletRequest(), response, new AccessDeniedException("sin permiso"));

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(response.getContentAsString())
                .contains("\"status\":403")
                .contains("No tienes permiso para realizar esta acción");
    }
}
