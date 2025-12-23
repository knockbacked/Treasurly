package com.example.backend.models;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testDefaultConstructorInitializesCreatedAt() {
        User user = new User();

        assertNotNull(user.getCreatedAt(), "createdAt should be initialized");
        assertTrue(user.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)),
                "createdAt should be close to current time");

        assertNull(user.getId());
        assertNull(user.getFirstName());
        assertNull(user.getLastName());
        assertNull(user.getEmail());
        assertNull(user.getPassword());
        assertNull(user.getLastLogin());
        assertFalse(user.getDisabled(), "disabled should default to false");
    }

    @Test
    void testParameterizedConstructorSetsFields() {
        User user = new User("Elvis", "Nguyen", "elvis@example.com", "securepass");

        assertEquals("Elvis", user.getFirstName());
        assertEquals("Nguyen", user.getLastName());
        assertEquals("elvis@example.com", user.getEmail());
        assertEquals("securepass", user.getPassword());
        assertFalse(user.getDisabled());
        assertNotNull(user.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        User user = new User();
        LocalDateTime now = LocalDateTime.now();

        user.setId("user123");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@example.com");
        user.setPassword("1234");
        user.setCreatedAt(now.minusDays(1));
        user.setLastLogin(now);
        user.setDisabled(true);

        assertEquals("user123", user.getId());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("1234", user.getPassword());
        assertEquals(now.minusDays(1), user.getCreatedAt());
        assertEquals(now, user.getLastLogin());
        assertTrue(user.getDisabled());
    }

    @Test
    void testToStringContainsKeyFields() {
        User user = new User("Alice", "Smith", "alice@mail.com", "pw");
        user.setId("U1");
        user.setLastLogin(LocalDateTime.now());

        String result = user.toString();

        assertTrue(result.contains("Alice"));
        assertTrue(result.contains("Smith"));
        assertTrue(result.contains("alice@mail.com"));
        assertTrue(result.contains("createdAt"));
    }

    @Test
    void testNullSafety() {
        User user = new User();
        user.setFirstName(null);
        user.setLastName(null);
        user.setEmail(null);
        user.setPassword(null);
        user.setLastLogin(null);

        assertNull(user.getFirstName());
        assertNull(user.getLastName());
        assertNull(user.getEmail());
        assertNull(user.getPassword());
        assertNull(user.getLastLogin());
    }
}
