package com.example.backend.config;

import com.example.backend.models.Category;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private static final int EXPECTED_CATEGORY_COUNT = 12;

    @Autowired
    public DataInitializer(CategoryRepository categoryRepository,
                           TransactionRepository transactionRepository,
                           BudgetRepository budgetRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long currentCount = categoryRepository.count();

        // Rerun if categories are missing or extra (not equal to expected)
        if (currentCount != EXPECTED_CATEGORY_COUNT) {
            System.out.printf("Category count mismatch (%d found, expected %d). Reseeding...%n", currentCount, EXPECTED_CATEGORY_COUNT);
            categoryRepository.deleteAll(); // optional: clear old categories
            createDefaultCategories();
        } else {
            System.out.println("Category count is already correct — skipping seeding.");
        }
    }

    private void createDefaultCategories() {
        Category[] defaultCategories = {
                new Category("Food & Dining", "#FF6B6B", "🍽️"),
                new Category("Transportation", "#4ECDC4", "🚗"),
                new Category("Shopping", "#45B7D1", "🛍️"),
                new Category("Entertainment", "#96CEB4", "🎬"),
                new Category("Healthcare", "#FFEAA7", "🏥"),
                new Category("Utilities", "#DDA0DD", "💡"),
                new Category("Housing", "#98D8C8", "🏠"),
                new Category("Education", "#F7DC6F", "📚"),
                new Category("Travel", "#BB8FCE", "✈️"),
                new Category("Salary", "#82E0AA", "💰"),
                new Category("Freelance", "#F8C471", "💼"),
                new Category("Investment", "#85C1E9", "📈")
        };

        for (Category category : defaultCategories) {
            categoryRepository.save(category);
        }

        System.out.println("Default categories initialized successfully!");
    }
}
