package com.example.backend.controllers;

import com.example.backend.models.Transaction;
import com.example.backend.services.TransactionService;
import com.example.backend.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TransactionController {

    private static final Logger logger = Logger.getLogger(TransactionController.class.getName());
    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // 🔹 Basic CRUD
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        logger.info("Fetching all transactions");
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        logger.info("Fetching transaction with ID: " + id);
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        logger.info("Creating new transaction");
        return ResponseEntity.ok(transactionService.createTransaction(transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable String id, @RequestBody Transaction transaction) {
        logger.info("Updating transaction with ID: " + id);
        return ResponseEntity.ok(transactionService.updateTransaction(id, transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        logger.info("Deleting transaction with ID: " + id);
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Filters
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable String type) {
        logger.info("Fetching transactions of type: " + type);
        return ResponseEntity.ok(transactionService.getTransactionsByType(type));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Transaction>> getTransactionsByCategory(@PathVariable String category) {
        logger.info("Fetching transactions in category: " + category);
        return ResponseEntity.ok(transactionService.getTransactionsByCategory(category));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable String userId) {
        logger.info("Fetching transactions for user: " + userId);
        return ResponseEntity.ok(transactionService.getTransactionsByUser(userId));
    }
}
