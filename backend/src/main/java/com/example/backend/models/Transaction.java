package com.example.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Date;


@Document(collection = "transactions")
public class Transaction {

    @Id
    private String transactionId;   // ERD PK
    private String userId;          // FK to user
    private String target;          // who/what transaction is with (merchant, payee, etc.)
    private String description;     // free text description
    private BigDecimal amount;      // transaction amount
    private String type;            // e.g. "INCOME" or "EXPENSE"
    private String category;        // e.g. "groceries", "salary"
    private Date created;  // transaction date
    private boolean isRecurring;    // subscription flag
    private Integer recurringRate;  // e.g. every X days/weeks/months

    public Transaction() {
        this.created = new Date();
    }

    public Transaction(String userId, String target, String description, BigDecimal amount,
                       String type, String category, boolean isRecurring, Integer recurringRate) {
        this();
        this.userId = userId;
        this.target = target;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.isRecurring = isRecurring;
        this.recurringRate = recurringRate;
    }

    // 🔹 Getters and setters

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public boolean isRecurring() {
        return isRecurring;
    }

    public void setRecurring(boolean recurring) {
        isRecurring = recurring;
    }

    public Integer getRecurringRate() {
        return recurringRate;
    }

    public void setRecurringRate(Integer recurringRate) {
        this.recurringRate = recurringRate;
    }
}
