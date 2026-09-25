package com.cortador.back.model.enums;

/**
 * Qué ha elegido el cliente en el desplegable "Localidad del evento".
 */
public enum LocalityOption {
    // La localidad del propio cortador: sin desplazamiento.
    HOME,
    // Una de las localidades de la lista del cortador: se cobran sus km.
    LISTED,
    // Una localidad que no está en la lista: desplazamiento "a consultar".
    OTHER
}
