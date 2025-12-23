package com.example.backend.repositories;

import com.example.backend.models.Budget;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
class BudgetRepositoryIntegrationTest {

    @Autowired
    private BudgetRepository budgetRepository;

    private Budget budget1, budget2;

    @BeforeEach
    void setUp() {
        budgetRepository.deleteAll();

        budget1 = new Budget("user123", "Monthly");
        budget1.setUpdatedAt(LocalDateTime.now().minusDays(1));

        budget2 = new Budget("user123", "Vacation");
        budget2.setUpdatedAt(LocalDateTime.now());

        budgetRepository.saveAll(List.of(budget1, budget2));
    }

    @Test
    void testFindByUserId() {
        List<Budget> result = budgetRepository.findByUserId("user123");
        assertEquals(2, result.size());
    }

    @Test
    void testFindByUserIdAndName() {
        List<Budget> result = budgetRepository.findByUserIdAndName("user123", "Vacation");
        assertEquals(1, result.size());
        assertEquals("Vacation", result.get(0).getName());
    }

    @Test
    void testFindByUserIdAndCreatedAtAfter() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(2);
        List<Budget> result = budgetRepository.findByUserIdAndCreatedAtAfter("user123", cutoff);
        assertFalse(result.isEmpty());
    }

    @Test
    void testFindByUserIdOrderByUpdatedAtDesc() {
        List<Budget> result = budgetRepository.findByUserIdOrderByUpdatedAtDesc("user123");
        assertEquals(2, result.size());
        assertTrue(result.get(0).getUpdatedAt().isAfter(result.get(1).getUpdatedAt()));
    }

    @Test
    void testExistsByUserIdAndName() {
        assertTrue(budgetRepository.existsByUserIdAndName("user123", "Monthly"));
        assertFalse(budgetRepository.existsByUserIdAndName("user123", "Nonexistent"));
    }
}
