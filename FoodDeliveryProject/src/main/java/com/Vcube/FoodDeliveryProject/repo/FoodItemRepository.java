package com.Vcube.FoodDeliveryProject.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Vcube.FoodDeliveryProject.model.FoodItem;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long>{

}
