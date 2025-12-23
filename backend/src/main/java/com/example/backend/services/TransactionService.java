package com.example.backend.services;

import com.example.backend.models.Transaction;
import com.example.backend.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.Date;


@Service
public class TransactionService {

    private static final Logger logger = Logger.getLogger(TransactionService.class.getName());
    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getAllTransactions() {
        try {
            List<Transaction> transactions = transactionRepository.findAll();
            logger.info("Retrieved " + transactions.size() + " transactions from service");
            return transactions;
        } catch (Exception e) {
            logger.severe("Error retrieving all transactions: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve transactions", e);
        }
    }

    public Optional<Transaction> getTransactionById(String id) { //optional<type>. prevents null pointer exceptions, read it
        try {
            Optional<Transaction> transaction = transactionRepository.findById(id);
            if (transaction.isPresent()) {
                logger.info("Retrieved transaction by Id: " + id);
            } else {
                logger.warning("Transaction not found with Id: " + id);
            }
            return transaction;
        } catch (Exception e) {
            logger.severe("Error retrieving transaction with Id " + id + ": " + e.getMessage());
            throw new RuntimeException("Failed to retrieve transaction", e);
        }
    }

    public Transaction createTransaction(Transaction transaction) {
        try {
            validateTransaction(transaction);            
            Transaction savedTransaction = transactionRepository.save(transaction);
            logger.info("Created new transaction: " + savedTransaction.getDescription() + " with Id: " + savedTransaction.getTransactionId());
            return savedTransaction;

        } catch (Exception e) {
            logger.severe("Error creating transaction: " + e.getMessage());
            throw new RuntimeException("Failed to create transaction", e);
        }
    }

    public Transaction updateTransaction(String id, Transaction transaction) {
        try {
            if (!transactionRepository.existsById(id)) {
                logger.warning("Cannot update: Transaction not found with Id: " + id);
                throw new IllegalArgumentException("Transaction not found with id: " + id);
            }            
            validateTransaction(transaction);            
            transaction.setTransactionId(id);
            Transaction savedTransaction = transactionRepository.save(transaction);
            logger.info("Updated transaction with Id: " + id);
            return savedTransaction;
            
        } catch (Exception e) {
            logger.severe("Error updating transaction with Id " + id + ": " + e.getMessage());
            throw new RuntimeException("Failed to update transaction", e);
        }
    }

    public void deleteTransaction(String id) {
        try {
            if (!transactionRepository.existsById(id)) {
                logger.warning("Cannot delete: Transaction not found with Id: " + id);
                throw new IllegalArgumentException("Transaction not found with id: " + id);
            }
            transactionRepository.deleteById(id);
            logger.info("Deleted transaction with Id: " + id);
            
        } catch (Exception e) {
            logger.severe("Error deleting transaction with Id " + id + ": " + e.getMessage());
            throw new RuntimeException("Failed to delete transaction", e);
        }
    }

    public List<Transaction> getTransactionsByType(String type) {
        try {
            List<Transaction> transactions = transactionRepository.findByType(type);
            logger.info("Retrieved " + transactions.size() + " transactions of type: " + type);
            return transactions;
        } catch (Exception e) {
            logger.severe("Error retrieving transactions by type " + type + ": " + e.getMessage());
            throw new RuntimeException("Failed to retrieve transactions by type", e);
        }
    }

    public List<Transaction> getTransactionsByCategory(String category) {
        try {
            List<Transaction> transactions = transactionRepository.findByCategory(category);
            logger.info("Retrieved " + transactions.size() + " transactions in category: " + category);
            return transactions;
        } catch (Exception e) {
            logger.severe("Error retrieving transactions by category " + category + ": " + e.getMessage());
            throw new RuntimeException("Failed to retrieve transactions by category", e);
        }
    }

    public BigDecimal getTotalIncome() {
        try {
            List<Transaction> incomeTransactions = transactionRepository.findByType("INCOME");
            BigDecimal totalIncome = incomeTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            logger.info("Calculated total income: " + totalIncome);
            return totalIncome;
            
        } catch (Exception e) {
            logger.severe("Error calculating total income: " + e.getMessage());
            throw new RuntimeException("Failed to calculate total income", e);
        }
    }

    public BigDecimal getTotalExpenses() {
        try {
            List<Transaction> expenseTransactions = transactionRepository.findByType("EXPENSE");
            BigDecimal totalExpenses = expenseTransactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            logger.info("Calculated total expenses: " + totalExpenses);
            return totalExpenses;
            
        } catch (Exception e) {
            logger.severe("Error calculating total expenses: " + e.getMessage());
            throw new RuntimeException("Failed to calculate total expenses", e);
        }
    }

    public BigDecimal getNetAmount() {
        try {
            BigDecimal netAmount = getTotalIncome().subtract(getTotalExpenses());
            logger.info("Calculated net amount: " + netAmount);
            return netAmount;
        } catch (Exception e) {
            logger.severe("Error calculating net amount: " + e.getMessage());
            throw new RuntimeException("Failed to calculate net amount", e);
        }
    }

    private void validateTransaction(Transaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        
        //change this as required for type of transaction
        if (transaction.getType() == null || (!transaction.getType().equals("INCOME") && !transaction.getType().equals("EXPENSE"))) {
            throw new IllegalArgumentException("Type must be either 'INCOME' or 'EXPENSE'");
        }
        
        if (transaction.getCategory() == null || transaction.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        
        logger.fine("Transaction validation passed for: " + transaction.getDescription());
    }

    // User specific queries 
    public List<Transaction> getTransactionsByUser(String userId) {
        return transactionRepository.findByUserId(userId);
    }

    // Date range (monthly summary, comparisons)

    public List<Transaction> getTransactionsByDateRange(String userId, Date start, Date end) {
        return transactionRepository.findByUserIdAndCreatedBetween(userId, start, end);
    }
    
    public BigDecimal getTotalSpendingForPeriod(String userId, Date start, Date end) {
        return getTransactionsByDateRange(userId, start, end).stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Recurring transactions
    public List<Transaction> getRecurringTransactions(String userId) {
        return transactionRepository.findByUserIdAndIsRecurringTrue(userId);
    }

    // Category + date filters
    public BigDecimal getTotalByCategoryForPeriod(String userId, String category, Date start, Date end) {
        return transactionRepository.findByUserIdAndCategoryAndCreatedBetween(userId, category, start, end)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Balance projection (recurring + future bills) we can revise this later 
    public BigDecimal projectBalance(String userId, BigDecimal currentBalance, int monthsAhead) {
        List<Transaction> recurring = getRecurringTransactions(userId);
        BigDecimal monthlyRecurring = recurring.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    
        return currentBalance.subtract(monthlyRecurring.multiply(BigDecimal.valueOf(monthsAhead)));
    }

    public BigDecimal getTotalIncomeByUser(String userId) {
        return transactionRepository.findByUserIdAndType(userId, "INCOME")
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getTotalExpensesByUser(String userId) {
        return transactionRepository.findByUserIdAndType(userId, "EXPENSE")
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    
    
    
    
    
}
