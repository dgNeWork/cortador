package com.cortador.back.dto.request;

import com.cortador.back.model.enums.SlotCoverage;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Marca que el cortador pone en un día del calendario. NONE deja el día
 * libre aunque una regla lo ocupe.
 */
@Getter
@Setter
public class DayMarkRequest {

    @NotNull(message = "Elige cómo queda el día")
    private SlotCoverage coverage;
}
