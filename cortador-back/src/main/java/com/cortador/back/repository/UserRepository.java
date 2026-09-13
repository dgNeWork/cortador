package com.cortador.back.repository;

import com.cortador.back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acceso a los datos de User (la cuenta de admin). findByEmail hace falta
 * porque el login se hace por email, no por el id de la base de datos.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
