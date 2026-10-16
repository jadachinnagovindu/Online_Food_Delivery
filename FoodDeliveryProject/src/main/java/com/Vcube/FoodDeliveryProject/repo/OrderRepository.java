package com.Vcube.FoodDeliveryProject.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Vcube.FoodDeliveryProject.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerNameIgnoreCase(String customerName);
  

}
