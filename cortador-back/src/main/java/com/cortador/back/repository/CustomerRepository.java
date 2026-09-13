package com.cortador.back.repository;

import com.cortador.back.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acceso a los datos de Customer. Al extender JpaRepository ya tenemos
 * gratis los métodos save/findById/findAll/delete, los genera Spring Data.
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Sirve para reutilizar el mismo cliente si ya existe, en vez de crear
    // uno duplicado cada vez que la misma persona hace otra reserva.
    Optional<Customer> findByEmail(String email);
}
