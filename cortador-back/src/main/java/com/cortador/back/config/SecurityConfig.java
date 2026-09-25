package com.cortador.back.config;

import com.cortador.back.security.JwtAuthenticationEntryPoint;
import com.cortador.back.security.JwtAuthenticationFilter;
import com.cortador.back.security.RestAccessDeniedHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad. La sesión es STATELESS (no hay cookies de
 * sesión): cada petición a un endpoint protegido debe llevar un JWT
 * válido en la cabecera Authorization, comprobado por JwtAuthenticationFilter.
 *
 * Público: registrar una reserva, pedir su presupuesto, ver el catálogo de
 * jamones y las localidades, y el login.
 * El resto (listar/editar reservas, el catálogo del panel...) es solo
 * para el admin logueado.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    // El frontend de React corre en otro puerto distinto al de la API, así
    // que el navegador exige CORS aunque los dos estén en localhost.
    @Value("${cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager es lo que usa AuthController para comprobar
    // el email/contraseña del login. Spring Boot lo construye solo a
    // partir de CustomUserDetailsService y el PasswordEncoder de arriba.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/bookings/quote").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/localities").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ham-types/**").permitAll()
                        // /error es la ruta interna a la que Spring reenvía los
                        // errores que no recoge GlobalExceptionHandler (por
                        // ejemplo, un Content-Type no soportado). Si estuviera
                        // protegida, cualquiera de esos errores en un endpoint
                        // público acabaría en un 401 engañoso en vez de su
                        // código real (400, 415...).
                        .requestMatchers("/error").permitAll()
                        // Endpoints del panel del cortador (catálogo, tarifas...).
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
