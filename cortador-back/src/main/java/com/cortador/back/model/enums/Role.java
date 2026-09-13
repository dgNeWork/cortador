package com.cortador.back.model.enums;

/**
 * Rol para el panel de administración. Solo el cortador (dueño del negocio)
 * inicia sesión - los clientes nunca necesitan cuenta, solo rellenan el
 * formulario público. Es un enum para que Spring Security use roles seguros.
 */
public enum Role {
    ADMIN
}
