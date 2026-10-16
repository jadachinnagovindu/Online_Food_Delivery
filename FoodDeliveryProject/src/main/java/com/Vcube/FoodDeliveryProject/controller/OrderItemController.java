package com.Vcube.FoodDeliveryProject.controller;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Vcube.FoodDeliveryProject.model.FoodItem;
import com.Vcube.FoodDeliveryProject.model.Order;
import com.Vcube.FoodDeliveryProject.model.OrderItem;

import com.Vcube.FoodDeliveryProject.repo.FoodItemRepository;
import com.Vcube.FoodDeliveryProject.repo.OrderRepository;
import com.Vcube.FoodDeliveryProject.repo.OrderItemRepository;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderItemController {

    @Autowired
    private OrderItemRepository repo;

    @Autowired
    private FoodItemRepository foodItemRepo;

    @Autowired
    private OrderRepository orderRepo;

    @PostMapping("/addorderitem")
    public OrderItem addOrderItem(@RequestBody OrderItem item) {

        FoodItem food = foodItemRepo.findById(
            item.getFoodItem().getId()
        ).orElseThrow(() ->
            new RuntimeException("Food item not found")
        );

        Order order = orderRepo.findById(
            item.getOrder().getId()
        ).orElseThrow(() ->
            new RuntimeException("Order not found")
        );

        if (item.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (!food.isAvailable()) {
            throw new RuntimeException("Food item is not available");
        }

        // Take the actual price from the database
        item.setPrice(food.getPrice());
        item.setFoodItem(food);
        item.setOrder(order);

        // Save the order item
        OrderItem savedItem = repo.save(item);

        // Calculate total for this order
        double total = repo.findAll().stream()
            .filter(oi -> oi.getOrder().getId().equals(order.getId()))
            .mapToDouble(oi ->
                oi.getPrice() * oi.getQuantity()
            )
            .sum();

        order.setTotalAmount(total);
        orderRepo.save(order);

        return savedItem;
    }

    @GetMapping("/getallorderitems")
    public List<OrderItem> getAllOrderItems() {
        return repo.findAll();
    }
}
