package com.cortador.back.controller;

import com.cortador.back.dto.request.HamTypeRequest;
import com.cortador.back.dto.response.HamTypeResponse;
import com.cortador.back.service.HamTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Gestión del catálogo de jamones desde el panel del cortador. Las rutas
 * que cuelgan de /api/admin exigen login de admin (ver SecurityConfig).
 *
 * No hay DELETE a propósito: un jamón se desactiva (active = false en el
 * PUT) para que las reservas antiguas que lo usan no se queden huérfanas.
 */
@RestController
@RequestMapping("/api/admin/ham-types")
@RequiredArgsConstructor
public class AdminHamTypeController {

    private final HamTypeService hamTypeService;

    @GetMapping
    public ResponseEntity<List<HamTypeResponse>> getAll() {
        List<HamTypeResponse> response = hamTypeService.findAll().stream()
                .map(HamTypeResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<HamTypeResponse> create(@Valid @RequestBody HamTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(HamTypeResponse.from(hamTypeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HamTypeResponse> update(@PathVariable Long id, @Valid @RequestBody HamTypeRequest request) {
        return ResponseEntity.ok(HamTypeResponse.from(hamTypeService.update(id, request)));
    }
}
