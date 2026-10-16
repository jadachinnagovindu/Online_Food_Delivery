package com.Vcube.FoodDeliveryProject.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Vcube.FoodDeliveryProject.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

}
