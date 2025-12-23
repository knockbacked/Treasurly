package com.example.backend.controllers;

import com.example.backend.models.Budget;
import com.example.backend.services.BudgetService;
import com.example.backend.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BudgetController {

    private final BudgetService budgetService;

    @Autowired
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(budgetService.getBudgetsByUser(userId));
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable String budgetId) {
        return budgetService.getBudgetById(budgetId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + budgetId));
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        return ResponseEntity.ok(budgetService.createBudget(budget));
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<Budget> updateBudget(@PathVariable String budgetId, @RequestBody Budget budget) {
        return ResponseEntity.ok(budgetService.updateBudget(budgetId, budget));
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String budgetId) {
        budgetService.deleteBudget(budgetId);
        return ResponseEntity.noContent().build();
    }

     @PostMapping("/{budgetId}/items")
    public ResponseEntity<Budget> addItemToBudget(
            @PathVariable String budgetId,
            @RequestParam String categoryId,
            @RequestParam BigDecimal amount,
            @RequestParam int frequency
    ) {
        Budget updatedBudget = budgetService.addItemToBudget(budgetId, categoryId, amount, frequency);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{budgetId}/items/{categoryId}")
    public ResponseEntity<Budget> removeItemFromBudget(
            @PathVariable String budgetId,
            @PathVariable String categoryId
    ) {
        Budget updatedBudget = budgetService.removeItemFromBudget(budgetId, categoryId);
        return ResponseEntity.ok(updatedBudget);
    }
}