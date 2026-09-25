package com.cortador.back.exception;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test de integración: a diferencia de los tests de servicios (que usan
 * Mockito y no arrancan nada), este levanta la aplicación entera en un
 * puerto aleatorio (RANDOM_PORT) y le hace peticiones HTTP de verdad,
 * igual que haría el navegador.
 *
 * Hace falta así porque el fallo que se comprueba aquí solo ocurre en un
 * servidor real: cuando Spring no sabe tratar un error, lo reenvía
 * internamente a la ruta /error, y si esa ruta pedía login, el cliente
 * recibía un 401 "Es necesario iniciar sesión" en endpoints públicos.
 * Las herramientas de test "simuladas" (MockMvc) no hacen ese reenvío,
 * así que no lo detectarían.
 *
 * Necesita la base de datos igual que CortadorBackApplicationTests (en
 * local, el Postgres de desarrollo; en CI, el servicio del workflow).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ErrorResponsesIntegrationTest {

    // Spring guarda aquí el puerto aleatorio en el que ha arrancado.
    @Value("${local.server.port}")
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void jsonMalFormadoEnUnEndpointPublicoDevuelve400YNo401() throws Exception {
        HttpResponse<String> response = postBooking("application/json", "{esto no es json");

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("El cuerpo de la petición no es válido");
    }

    @Test
    void valorInexistenteEnUnEnumDevuelve400() throws Exception {
        // "PARTY" no existe en EventType: Jackson no puede convertirlo y
        // lanza el mismo tipo de error que con un JSON roto.
        HttpResponse<String> response = postBooking("application/json", "{\"eventType\":\"PARTY\"}");

        assertThat(response.statusCode()).isEqualTo(400);
    }

    @Test
    void errorQueSpringResuelvePorSuCuentaDevuelveSuCodigoRealYNo401() throws Exception {
        // Un Content-Type que la API no acepta no pasa por nuestro
        // GlobalExceptionHandler: Spring responde 415 y lo reenvía a /error.
        // Es justo el caso que antes acababa convertido en 401.
        HttpResponse<String> response = postBooking("text/plain", "hola");

        assertThat(response.statusCode()).isEqualTo(415);
    }

    @Test
    void listarReservasSinTokenSigueDevolviendo401() throws Exception {
        // Comprobación de que abrir /error no ha abierto nada más: el
        // listado de reservas sigue siendo solo para el admin.
        HttpRequest request = HttpRequest.newBuilder(url("/api/bookings")).GET().build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(401);
    }

    private HttpResponse<String> postBooking(String contentType, String body)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(url("/api/bookings"))
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private URI url(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
