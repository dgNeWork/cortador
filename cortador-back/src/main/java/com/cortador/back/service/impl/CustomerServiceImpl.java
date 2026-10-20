package com.cortador.back.service.impl;

import com.cortador.back.model.Customer;
import com.cortador.back.repository.CustomerRepository;
import com.cortador.back.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public Customer findOrCreate(String name, String email, String phone) {
        // El email se guarda y se busca siempre igual (sin espacios y en
        // minúsculas): "Lucia@Gmail.com" y "lucia@gmail.com" son la misma
        // persona, y sin esto se crearían dos clientes distintos.
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        // Si ya existe, actualizamos su ficha con los últimos datos que ha
        // escrito (puede haber corregido el teléfono). Cada reserva guarda
        // además su propia copia, así que las antiguas no cambian.
        // Si no existe, lo creamos.
        Customer customer = customerRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> Customer.builder().email(normalizedEmail).build());
        customer.setName(name.trim());
        customer.setPhone(phone.trim());
        return customerRepository.save(customer);
    }
}
