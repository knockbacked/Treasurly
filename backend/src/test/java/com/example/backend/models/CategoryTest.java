package com.example.backend.models;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CategoryTest {

    @Test
    void testDefaultConstructorAndSetters() {
        Category category = new Category();

        category.setId("123");
        category.setName("Food");
        category.setColor("#FF0000");
        category.setIcon("🍔");

        assertEquals("123", category.getId());
        assertEquals("Food", category.getName());
        assertEquals("#FF0000", category.getColor());
        assertEquals("🍔", category.getIcon());
    }

    @Test
    void testSingleArgConstructor() {
        Category category = new Category("Transport");

        assertEquals("Transport", category.getName());
        assertNull(category.getColor());
        assertNull(category.getIcon());
    }

    @Test
    void testThreeArgConstructor() {
        Category category = new Category("Shopping", "#00FF00", "🛍️");

        assertEquals("Shopping", category.getName());
        assertEquals("#00FF00", category.getColor());
        assertEquals("🛍️", category.getIcon());
    }

    @Test
    void testMutability() {
        Category category = new Category("Bills", "#0000FF", "💡");
        category.setName("Utilities");
        category.setColor("#FFFF00");
        category.setIcon("⚡");

        assertEquals("Utilities", category.getName());
        assertEquals("#FFFF00", category.getColor());
        assertEquals("⚡", category.getIcon());
    }

    @Test
    void testNullSafety() {
        Category category = new Category();
        category.setName(null);
        category.setColor(null);
        category.setIcon(null);

        assertNull(category.getName());
        assertNull(category.getColor());
        assertNull(category.getIcon());
    }
}
