package com.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "budgets")
public class Budget {

    @Id
    private String id;
    private String userId;
    private String name;
    private String description;
    private List<BudgetItem> items; // now a list of BudgetItem
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Budget() {
        this.items = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Budget(String userId, String name) {
        this();
        this.userId = userId;
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<BudgetItem> getItems() { return items; }
    public void setItems(List<BudgetItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void addItem(Category category, BigDecimal amount, int frequency) {
        this.items.add(new BudgetItem(category, amount, frequency));
        this.updatedAt = LocalDateTime.now();
    }

    public void removeItem(String categoryId) {
        this.items.removeIf(i -> i.getCategory().getId().equals(categoryId));
        this.updatedAt = LocalDateTime.now();
    }

    // nested mini class because it was way too hard to map it
    public static class BudgetItem {
        private Category category;
        private BigDecimal amount;
        private int frequency; // frequency in days

        public BudgetItem() {}

        public BudgetItem(Category category, BigDecimal amount, int frequency) {
            this.category = category;
            this.amount = amount;
            this.frequency = frequency;
        }

        public Category getCategory() { return category; }
        public void setCategory(Category category) { this.category = category; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public int getFrequency() { return frequency; }
        public void setFrequency(int frequency) { this.frequency = frequency; }
    }
}