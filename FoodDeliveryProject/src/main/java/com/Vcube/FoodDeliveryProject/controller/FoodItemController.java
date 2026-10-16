package com.Vcube.FoodDeliveryProject.controller;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Vcube.FoodDeliveryProject.model.FoodItem;
import com.Vcube.FoodDeliveryProject.repo.FoodItemRepository;



@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodItemController {

    @Autowired
    private FoodItemRepository repo;

    @PostMapping("/adddata")
    public FoodItem addFood(@RequestBody FoodItem food) {
        return repo.save(food);
    }

    @GetMapping("/getalldata")
    public List<FoodItem> getAllFoods() {
        return repo.findAll();
    }

    @GetMapping("/getfoodbyid/{id}")
    public Optional<FoodItem> getFoodById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @PutMapping("/updatefood/{id}")
    public FoodItem updateFood(@PathVariable Long id, @RequestBody FoodItem food) {
    	FoodItem fooditems=repo.findById(id).get();
    	
    	fooditems.setName(food.getName());
    	fooditems.setPrice(food.getPrice());
    	fooditems.setDescription(food.getDescription());
    	fooditems.setAvailable(food.isAvailable());
    	
    	 return repo.save(fooditems);
       
        
    }

    @DeleteMapping("/deletefood/{id}")
    public String deleteFood(@PathVariable Long id) {
        repo.deleteById(id);
        return "Food deleted successfully";
    }
}
