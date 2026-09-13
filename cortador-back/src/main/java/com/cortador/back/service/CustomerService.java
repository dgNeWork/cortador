package com.cortador.back.service;

import com.cortador.back.model.Customer;

public interface CustomerService {

    /**
     * Devuelve el cliente que ya existe con este email, o crea uno nuevo si
     * no existe. Evita que un cliente que reserva varias veces se duplique
     * en la base de datos.
     */
    Customer findOrCreate(String name, String email, String phone);
}
