package com.example.backend.repositories;

import com.example.backend.models.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
class CategoryRepositoryIntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();

        categoryRepository.save(new Category("Food", "#FF0000", "🍔"));
        categoryRepository.save(new Category("Transport", "#00FF00", "🚗"));
    }

    @Test
    void testFindByNameReturnsCorrectCategory() {
        Category result = categoryRepository.findByName("Food");

        assertNotNull(result);
        assertEquals("Food", result.getName());
        assertEquals("#FF0000", result.getColor());
        assertEquals("🍔", result.getIcon());
    }

    @Test
    void testFindByNameReturnsNullIfNotFound() {
        Category result = categoryRepository.findByName("Nonexistent");
        assertNull(result);
    }
}
