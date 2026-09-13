package com.cortador.back.model;

import com.cortador.back.model.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Cuenta de administrador del cortador, para entrar en el panel y
 * gestionar las reservas que van llegando (confirmar/cancelar/completar).
 * La tabla se llama "users" y no "user" porque USER es una palabra
 * reservada en PostgreSQL y daría problemas en SQL más adelante.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// Excluimos la contraseña del toString para que nunca aparezca sin
// querer en un log.
@ToString(exclude = "password")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // Aquí se guarda la contraseña cifrada (hash, por ejemplo con BCrypt),
    // nunca la contraseña en texto plano.
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
