package com.cortador.back.controller;

import com.cortador.back.dto.response.HamTypeResponse;
import com.cortador.back.service.HamTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catálogo público de tipos de jamón, de solo lectura. El formulario de
 * reserva lo usa para que el cliente elija uno en una reserva FULL_SERVICE,
 * así que solo devuelve los que el cortador tiene activos. La gestión del
 * catálogo está en AdminHamTypeController.
 */
@RestController
@RequestMapping("/api/ham-types")
@RequiredArgsConstructor
public class HamTypeController {

    private final HamTypeService hamTypeService;

    @GetMapping
    public ResponseEntity<List<HamTypeResponse>> getAll() {
        List<HamTypeResponse> response = hamTypeService.findAllActive().stream()
                .map(HamTypeResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }
}
