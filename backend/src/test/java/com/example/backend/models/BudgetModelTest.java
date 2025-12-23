package com.example.backend.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BudgetTest {

    private Budget budget;
    private Category categoryFood;
    private Category categoryRent;

    @BeforeEach
    void setUp() {
        budget = new Budget("user123", "Monthly Budget");
        categoryFood = new Category();
        categoryFood.setId("cat_food");
        categoryFood.setName("Food");

        categoryRent = new Category();
        categoryRent.setId("cat_rent");
        categoryRent.setName("Rent");
    }

    @Test
    void testDefaultConstructorInitializesFields() {
        Budget newBudget = new Budget();
        assertNotNull(newBudget.getItems(), "Items list should be initialized");
        assertNotNull(newBudget.getCreatedAt(), "CreatedAt should be initialized");
        assertNotNull(newBudget.getUpdatedAt(), "UpdatedAt should be initialized");
        assertTrue(newBudget.getItems().isEmpty(), "Items list should start empty");
    }

    @Test
    void testParameterizedConstructorSetsUserAndName() {
        assertEquals("user123", budget.getUserId());
        assertEquals("Monthly Budget", budget.getName());
        assertNotNull(budget.getItems());
    }

    @Test
    void testSettersAndGetters() {
        budget.setDescription("My monthly expense plan");
        budget.setUserId("user456");
        budget.setName("Updated Name");

        assertEquals("user456", budget.getUserId());
        assertEquals("Updated Name", budget.getName());
        assertEquals("My monthly expense plan", budget.getDescription());
    }

    @Test
    void testAddItemIncreasesListSize() {
        int initialSize = budget.getItems().size();

        budget.addItem(categoryFood, new BigDecimal("200.00"), 30);

        assertEquals(initialSize + 1, budget.getItems().size(), "Item should be added");
        Budget.BudgetItem added = budget.getItems().get(0);
        assertEquals("cat_food", added.getCategory().getId());
        assertEquals(new BigDecimal("200.00"), added.getAmount());
        assertEquals(30, added.getFrequency());
    }

    @Test
    void testAddItemUpdatesTimestamp() throws InterruptedException {
        LocalDateTime before = budget.getUpdatedAt();

        // small delay to ensure time difference
        Thread.sleep(5);

        budget.addItem(categoryFood, new BigDecimal("50.00"), 7);

        assertFalse(budget.getUpdatedAt().isBefore(before),
                "UpdatedAt should be equal or after the previous timestamp");
        assertNotEquals(before, budget.getUpdatedAt(),
                "UpdatedAt should update to a new value");
    }
    @Test
    void testRemoveItemRemovesCorrectCategory() {
        budget.addItem(categoryFood, new BigDecimal("50.00"), 7);
        budget.addItem(categoryRent, new BigDecimal("1000.00"), 30);

        assertEquals(2, budget.getItems().size());
        budget.removeItem("cat_food");

        List<Budget.BudgetItem> items = budget.getItems();
        assertEquals(1, items.size(), "Should have 1 item after removal");
        assertEquals("cat_rent", items.get(0).getCategory().getId());
    }

    @Test
    void testRemoveItemUpdatesTimestamp() throws InterruptedException {
        budget.addItem(categoryFood, new BigDecimal("50.00"), 7);
        LocalDateTime before = budget.getUpdatedAt();

        Thread.sleep(5); // ensure measurable difference

        budget.removeItem("cat_food");

        assertFalse(budget.getUpdatedAt().isBefore(before),
                "UpdatedAt should be equal or after previous timestamp");
        assertNotEquals(before, budget.getUpdatedAt(),
                "UpdatedAt should update to a new value");
    }
    @Test
    void testBudgetItemSettersAndGetters() {
        Budget.BudgetItem item = new Budget.BudgetItem();
        item.setCategory(categoryRent);
        item.setAmount(new BigDecimal("300"));
        item.setFrequency(15);

        assertEquals(categoryRent, item.getCategory());
        assertEquals(new BigDecimal("300"), item.getAmount());
        assertEquals(15, item.getFrequency());
    }
}
