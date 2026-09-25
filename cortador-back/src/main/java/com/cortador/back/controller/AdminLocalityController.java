package com.cortador.back.controller;

import com.cortador.back.dto.request.LocalityRequest;
import com.cortador.back.dto.response.LocalityResponse;
import com.cortador.back.service.LocalityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Localidades a las que se desplaza el cortador, con sus km, desde el panel.
 */
@RestController
@RequestMapping("/api/admin/localities")
@RequiredArgsConstructor
public class AdminLocalityController {

    private final LocalityService localityService;

    @GetMapping
    public ResponseEntity<List<LocalityResponse>> getAll() {
        return ResponseEntity.ok(localityService.findAll().stream().map(LocalityResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<LocalityResponse> create(@Valid @RequestBody LocalityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(LocalityResponse.from(localityService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalityResponse> update(@PathVariable Long id, @Valid @RequestBody LocalityRequest request) {
        return ResponseEntity.ok(LocalityResponse.from(localityService.update(id, request)));
    }

    // 204 No Content: se ha borrado y no hay nada que devolver.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        localityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
