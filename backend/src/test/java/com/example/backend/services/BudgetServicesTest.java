package com.example.backend.services;

import com.example.backend.models.Budget;
import com.example.backend.models.Category;
import com.example.backend.models.Transaction;
import com.example.backend.repositories.BudgetRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryRepository categoryRepository;

    @InjectMocks private BudgetService budgetService;

    private Budget budget;
    private Category category;

    @BeforeEach
    void setUp() {
        budget = new Budget("user123", "Monthly Budget");
        budget.setId("budget1");

        category = new Category();
        category.setId("cat_food");
        category.setName("Food");
    }

    // --- getBudgetsByUser() --------------------------------------------------
    @Test
    void testGetBudgetsByUser() {
        when(budgetRepository.findByUserId("user123")).thenReturn(List.of(budget));

        List<Budget> result = budgetService.getBudgetsByUser("user123");

        assertEquals(1, result.size());
        assertEquals("Monthly Budget", result.get(0).getName());
        verify(budgetRepository).findByUserId("user123");
    }

    // --- getBudgetById() -----------------------------------------------------
    @Test
    void testGetBudgetByIdFound() {
        when(budgetRepository.findById("budget1")).thenReturn(Optional.of(budget));

        Optional<Budget> result = budgetService.getBudgetById("budget1");

        assertTrue(result.isPresent());
        assertEquals("budget1", result.get().getId());
    }

    @Test
    void testGetBudgetByIdNotFound() {
        when(budgetRepository.findById("budgetX")).thenReturn(Optional.empty());
        Optional<Budget> result = budgetService.getBudgetById("budgetX");
        assertFalse(result.isPresent());
    }

    // --- createBudget() ------------------------------------------------------
    @Test
    void testCreateBudgetSuccess() {
        when(budgetRepository.save(budget)).thenReturn(budget);
        Budget result = budgetService.createBudget(budget);
        assertEquals(budget, result);
        verify(budgetRepository).save(budget);
    }

    @Test
    void testCreateBudgetMissingUserThrowsError() {
        budget.setUserId(null);
        assertThrows(IllegalArgumentException.class, () -> budgetService.createBudget(budget));
    }

    @Test
    void testCreateBudgetMissingNameThrowsError() {
        budget.setName("");
        assertThrows(IllegalArgumentException.class, () -> budgetService.createBudget(budget));
    }

    // --- updateBudget() ------------------------------------------------------
    @Test
    void testUpdateBudgetSuccess() {
        when(budgetRepository.existsById("budget1")).thenReturn(true);
        when(budgetRepository.save(budget)).thenReturn(budget);

        Budget result = budgetService.updateBudget("budget1", budget);

        assertEquals("budget1", result.getId());
        verify(budgetRepository).save(budget);
    }

    @Test
    void testUpdateBudgetNotFoundThrowsError() {
        when(budgetRepository.existsById("missing")).thenReturn(false);
        assertThrows(IllegalArgumentException.class,
                () -> budgetService.updateBudget("missing", budget));
    }

    // --- deleteBudget() ------------------------------------------------------
    @Test
    void testDeleteBudgetSuccess() {
        when(budgetRepository.existsById("budget1")).thenReturn(true);
        doNothing().when(budgetRepository).deleteById("budget1");

        budgetService.deleteBudget("budget1");
        verify(budgetRepository).deleteById("budget1");
    }

    @Test
    void testDeleteBudgetNotFoundThrowsError() {
        when(budgetRepository.existsById("bad")).thenReturn(false);
        assertThrows(IllegalArgumentException.class,
                () -> budgetService.deleteBudget("bad"));
    }

    // --- addItemToBudget() ---------------------------------------------------
    @Test
    void testAddItemToBudgetSuccess() {
        when(budgetRepository.findById("budget1")).thenReturn(Optional.of(budget));
        when(categoryRepository.findById("cat_food")).thenReturn(Optional.of(category));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(inv -> inv.getArgument(0));

        Budget result = budgetService.addItemToBudget("budget1", "cat_food",
                new BigDecimal("100.00"), 30);

        assertEquals(1, result.getItems().size());
        assertEquals("cat_food", result.getItems().get(0).getCategory().getId());
        verify(budgetRepository).save(result);
    }

    @Test
    void testAddItemToBudgetMissingBudgetThrowsError() {
        when(budgetRepository.findById("budgetX")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> budgetService.addItemToBudget("budgetX", "cat_food", BigDecimal.ONE, 7));
    }

    @Test
    void testAddItemToBudgetMissingCategoryThrowsError() {
        when(budgetRepository.findById("budget1")).thenReturn(Optional.of(budget));
        when(categoryRepository.findById("badCat")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> budgetService.addItemToBudget("budget1", "badCat", BigDecimal.ONE, 7));
    }

    // --- removeItemFromBudget() ----------------------------------------------
    @Test
    void testRemoveItemFromBudgetSuccess() {
        // Add existing item first
        budget.addItem(category, new BigDecimal("50.00"), 7);
        when(budgetRepository.findById("budget1")).thenReturn(Optional.of(budget));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(inv -> inv.getArgument(0));

        Budget result = budgetService.removeItemFromBudget("budget1", "cat_food");

        assertTrue(result.getItems().isEmpty(), "Should remove the category from items");
        verify(budgetRepository).save(result);
    }

    // --- getBudgetPerformance() ----------------------------------------------
    @Test
    void testGetBudgetPerformanceCalculatesCorrectly() {
        budget.addItem(category, new BigDecimal("100.00"), 30);

        Transaction t1 = new Transaction();
        t1.setType("EXPENSE");
        t1.setAmount(new BigDecimal("20.00"));
        Transaction t2 = new Transaction();
        t2.setType("EXPENSE");
        t2.setAmount(new BigDecimal("30.00"));
        Transaction t3 = new Transaction();
        t3.setType("INCOME");
        t3.setAmount(new BigDecimal("10.00"));

        when(budgetRepository.findById("budget1")).thenReturn(Optional.of(budget));
        when(transactionRepository.findByUserIdAndCategoryAndCreatedBetween(
                eq("user123"), eq("cat_food"), any(Date.class), any(Date.class)))
                .thenReturn(List.of(t1, t2, t3));

        BigDecimal result = budgetService.getBudgetPerformance(
                "budget1", new Date(), new Date());

        assertEquals(new BigDecimal("50.00"), result);
    }

    @Test
    void testGetBudgetPerformanceBudgetNotFoundThrowsError() {
        when(budgetRepository.findById("badId")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> budgetService.getBudgetPerformance("badId", new Date(), new Date()));
    }
}
