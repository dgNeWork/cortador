package com.cortador.back.pricing;

import com.cortador.back.dto.request.PricingInput;
import com.cortador.back.model.HamType;
import com.cortador.back.model.Locality;
import com.cortador.back.model.PricingSettings;
import com.cortador.back.model.enums.ServiceType;
import com.cortador.back.repository.LocalityRepository;
import com.cortador.back.service.HamTypeService;
import com.cortador.back.service.PricingSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Prepara un presupuesto: busca las tarifas, el jamón y la localidad que
 * ha elegido el cliente, comprueba que la elección es válida y le pasa
 * todo a PriceCalculator para que haga las cuentas.
 *
 * Lo usan el presupuesto en vivo del formulario y la creación de la
 * reserva, así que el cliente ve exactamente el mismo precio que luego
 * se guarda.
 */
@Service
@RequiredArgsConstructor
public class QuoteService {

    // Nombre que se muestra si el cortador aún no ha dicho cuál es su localidad.
    static final String UNKNOWN_HOME_LOCALITY = "Localidad del cortador";

    private final PricingSettingsService pricingSettingsService;
    private final HamTypeService hamTypeService;
    private final LocalityRepository localityRepository;
    private final PriceCalculator priceCalculator;

    /**
     * @throws IllegalArgumentException si la elección del cliente no es válida
     *                                  (falta el jamón, el jamón está desactivado, falta la localidad...)
     */
    public Quote quote(PricingInput input) {
        PricingSettings settings = pricingSettingsService.find().orElse(null);
        HamType hamType = resolveHamType(input);

        String localityName;
        Integer distanceKm;
        switch (input.getLocalityOption()) {
            case HOME -> {
                localityName = settings != null ? settings.getHomeLocality() : UNKNOWN_HOME_LOCALITY;
                distanceKm = 0;
            }
            case LISTED -> {
                Locality locality = resolveListedLocality(input.getLocalityId());
                localityName = locality.getName();
                distanceKm = locality.getDistanceKm();
            }
            // Localidad fuera de la lista: no sabemos los km, así que el
            // desplazamiento (y el total) quedan "a consultar".
            case OTHER -> {
                if (input.getOtherLocalityName() == null || input.getOtherLocalityName().isBlank()) {
                    throw new IllegalArgumentException("Escribe la localidad del evento");
                }
                localityName = input.getOtherLocalityName().trim();
                distanceKm = null;
            }
            default -> throw new IllegalArgumentException("Opción de localidad no válida");
        }

        PriceBreakdown breakdown = priceCalculator.calculate(
                settings, input.getEstimatedDurationHours(), hamType, distanceKm);
        return new Quote(hamType, localityName, breakdown);
    }

    // Reglas de negocio del jamón: el servicio completo exige elegir uno,
    // y tiene que estar activo en el catálogo.
    private HamType resolveHamType(PricingInput input) {
        if (input.getServiceType() != ServiceType.FULL_SERVICE) {
            return null;
        }
        if (input.getHamTypeId() == null) {
            throw new IllegalArgumentException("Para el servicio completo hay que elegir un jamón");
        }
        HamType hamType = hamTypeService.findById(input.getHamTypeId());
        if (!hamType.isActive()) {
            throw new IllegalArgumentException("El jamón elegido ya no está disponible");
        }
        return hamType;
    }

    private Locality resolveListedLocality(Long localityId) {
        if (localityId == null) {
            throw new IllegalArgumentException("Elige la localidad del evento");
        }
        // Puede pasar si el cortador la quita mientras el cliente rellena
        // el formulario: es un error del cliente (400), no un 404.
        return localityRepository.findById(localityId)
                .orElseThrow(() -> new IllegalArgumentException("La localidad elegida ya no está disponible"));
    }
}
