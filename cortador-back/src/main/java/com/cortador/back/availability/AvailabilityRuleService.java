package com.cortador.back.availability;

import com.cortador.back.dto.request.AvailabilityRuleRequest;
import com.cortador.back.exception.ResourceNotFoundException;
import com.cortador.back.model.AvailabilityRule;
import com.cortador.back.model.enums.SlotCoverage;
import com.cortador.back.repository.AvailabilityRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.List;

/**
 * Alta, edición y borrado de las reglas habituales del cortador. El
 * cálculo de qué días ocupan lo hace AvailabilityService.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityRuleService {

    private final AvailabilityRuleRepository availabilityRuleRepository;

    public List<AvailabilityRule> findAll() {
        return availabilityRuleRepository.findAll();
    }

    public AvailabilityRule create(AvailabilityRuleRequest request) {
        AvailabilityRule rule = new AvailabilityRule();
        apply(rule, request);
        return availabilityRuleRepository.save(rule);
    }

    public AvailabilityRule update(Long id, AvailabilityRuleRequest request) {
        AvailabilityRule rule = findById(id);
        apply(rule, request);
        return availabilityRuleRepository.save(rule);
    }

    public void delete(Long id) {
        availabilityRuleRepository.delete(findById(id));
    }

    private AvailabilityRule findById(Long id) {
        return availabilityRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna regla con id " + id));
    }

    // Comprueba las reglas que dependen de varios campos y copia los datos.
    private void apply(AvailabilityRule rule, AvailabilityRuleRequest request) {
        // Una regla que no ocupa nada no tiene sentido (para liberar un día
        // concreto está la marca "libre").
        if (request.getCoverage() == SlotCoverage.NONE) {
            throw new IllegalArgumentException("Una regla tiene que ocupar al menos una franja");
        }
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("La fecha final no puede ser anterior a la inicial");
        }
        rule.setDaysOfWeek(EnumSet.copyOf(request.getDaysOfWeek()));
        rule.setCoverage(request.getCoverage());
        rule.setStartDate(request.getStartDate());
        rule.setEndDate(request.getEndDate());
    }
}
