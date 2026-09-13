package com.cortador.back.service.impl;

import com.cortador.back.model.Customer;
import com.cortador.back.repository.CustomerRepository;
import com.cortador.back.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public Customer findOrCreate(String name, String email, String phone) {
        // Si ya hay un cliente con este email, lo devolvemos tal cual.
        // Si no existe, creamos uno nuevo y lo guardamos en la base de datos.
        return customerRepository.findByEmail(email)
                .orElseGet(() -> customerRepository.save(
                        Customer.builder()
                                .name(name)
                                .email(email)
                                .phone(phone)
                                .build()));
    }
}
