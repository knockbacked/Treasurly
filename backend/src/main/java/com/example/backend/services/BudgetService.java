package com.example.backend.services;

import com.example.backend.models.Budget;
import com.example.backend.models.Category;
import com.example.backend.models.Budget.BudgetItem;
import com.example.backend.models.Transaction;
import com.example.backend.repositories.BudgetRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class BudgetService {

    private static final Logger logger = Logger.getLogger(BudgetService.class.getName());
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository,
                         TransactionRepository transactionRepository, 
                         CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Budget> getBudgetsByUser(String userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Optional<Budget> getBudgetById(String budgetId) {
        return budgetRepository.findById(budgetId);
    }

    public Budget createBudget(Budget budget) {
        validateBudget(budget);
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(String budgetId, Budget budget) {
        if (!budgetRepository.existsById(budgetId)) {
            throw new IllegalArgumentException("Budget not found with id: " + budgetId);
        }
        budget.setId(budgetId);
        return budgetRepository.save(budget);
    }

    public void deleteBudget(String budgetId) {
        if (!budgetRepository.existsById(budgetId)) {
            throw new IllegalArgumentException("Budget not found with id: " + budgetId);
        }
        budgetRepository.deleteById(budgetId);
    }

    public Budget addItemToBudget(String budgetId, String categoryId, BigDecimal amount, int frequency) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        BudgetItem item = new BudgetItem(category, amount, frequency);

        budget.getItems().add(item);
        return budgetRepository.save(budget);
    }

    public Budget removeItemFromBudget(String budgetId, String categoryId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        budget.getItems().removeIf(item -> item.getCategory().getId().equals(categoryId));
        return budgetRepository.save(budget);
    }

    public BigDecimal getBudgetPerformance(String budgetId, Date startDate, Date endDate) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        BigDecimal totalSpent = BigDecimal.ZERO;

        for (BudgetItem item : budget.getItems()) {
            List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryAndCreatedBetween(
                    budget.getUserId(), item.getCategory().getId(), startDate, endDate);

            BigDecimal categorySpent = transactions.stream()
                    .filter(t -> "EXPENSE".equals(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            totalSpent = totalSpent.add(categorySpent);
        }

        return totalSpent;
    }
    
    private void validateBudget(Budget budget) {
        if (budget.getUserId() == null || budget.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (budget.getName() == null || budget.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Budget name is required");
        }
    }
}