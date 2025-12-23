package com.example.backend.controllers;

import com.example.backend.models.User;
import com.example.backend.services.TransactionService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
public class AnalyticsController {

    private final TransactionService transactionService;

    public AnalyticsController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Basic + recurring projection summary
    @GetMapping("/summary/{userId}")
    public ResponseEntity<Map<String, BigDecimal>> getSummary(@PathVariable String userId) {
        BigDecimal income = transactionService.getTotalIncomeByUser(userId);
        BigDecimal expenses = transactionService.getTotalExpensesByUser(userId);
        BigDecimal net = income.subtract(expenses);
        BigDecimal projection = transactionService.projectBalance(userId, net, 3);

        return ResponseEntity.ok(Map.of(
            "income", income,
            "expenses", expenses,
            "net", net,
            "projectedSpending", projection
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, BigDecimal>> getSummaryForCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = user.getId();
        BigDecimal income = transactionService.getTotalIncomeByUser(userId);
        BigDecimal expenses = transactionService.getTotalExpensesByUser(userId);
        BigDecimal net = income.subtract(expenses);
        BigDecimal projection = transactionService.projectBalance(userId, net, 3);

        return ResponseEntity.ok(Map.of(
            "income", income,
            "expenses", expenses,
            "net", net,
            "projectedSpending", projection
        ));
    }


    

    
}
