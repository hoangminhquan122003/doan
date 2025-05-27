package com.group19.OrderManagementSystem_backend.controller;

import com.group19.OrderManagementSystem_backend.entity.Order;
import com.group19.OrderManagementSystem_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
@RestController
public class PaymentController {
    @Autowired
    OrderRepository orderRepository;
    @GetMapping("/payment/qr-info/{orderId}")
    public ResponseEntity<?> getQRInfo(@PathVariable String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bankId", "MBBank");
        response.put("accountNumber", "0966944842");
        response.put("accountName", "HOANG MINH QUAN");
        response.put("amount", order.getTotalPrice());
        response.put("note", "PHUCAN " + order.getNote());

        return ResponseEntity.ok(response);
    }

}
