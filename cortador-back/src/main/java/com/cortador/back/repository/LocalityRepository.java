package com.cortador.back.repository;

import com.cortador.back.model.Locality;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acceso a las localidades a las que se desplaza el cortador.
 * Spring Data genera la consulta SQL a partir del nombre del método.
 */
public interface LocalityRepository extends JpaRepository<Locality, Long> {

    // De la más cercana a la más lejana, que es como las busca el cliente.
    List<Locality> findAllByOrderByDistanceKmAsc();

    // Para no repetir localidades: "Cádiz" y "cádiz" cuentan como la misma.
    boolean existsByNameIgnoreCase(String name);

    // Igual, pero al editar: la propia localidad no cuenta como repetida.
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
