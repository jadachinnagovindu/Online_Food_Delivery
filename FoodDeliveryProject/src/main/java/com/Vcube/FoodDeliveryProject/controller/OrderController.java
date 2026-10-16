package com.Vcube.FoodDeliveryProject.controller;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Vcube.FoodDeliveryProject.model.Order;
import com.Vcube.FoodDeliveryProject.repo.OrderRepository;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository repo;

    @PostMapping("/placeorder")
    public Order placeOrder(@RequestBody Order order) {
        return repo.save(order);
    }

    @GetMapping("/getallorders")
    public List<Order> getAllOrders() {
        return repo.findAll();
    }
    @GetMapping("/customer/{customerName}")
    public List<Order> getOrdersByCustomer(
            @PathVariable String customerName) {

        return repo.findByCustomerNameIgnoreCase(customerName);
    }
    @PutMapping("/cancelorder/{id}")
    public Order cancelOrder(@PathVariable Long id) {
        Order order = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order is already cancelled");
        }

        order.setStatus("CANCELLED");
        return repo.save(order);
    }

    @GetMapping("/getorderbyid/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}