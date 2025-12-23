package com.example.backend.models;


import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MessageTest {

    @Test
    void testDefaultConstructorAndSetters() {
        Message message = new Message();

        message.setContent("Hello, world!");
        // id is null until persistence assigns it
        assertNull(message.getId());
        assertEquals("Hello, world!", message.getContent());
    }

    @Test
    void testSingleArgConstructor() {
        Message message = new Message("Budget saved successfully.");

        assertEquals("Budget saved successfully.", message.getContent());
        assertNull(message.getId(), "Id should be null before persistence");
    }

    @Test
    void testContentMutability() {
        Message message = new Message("Old content");
        message.setContent("Updated content");

        assertEquals("Updated content", message.getContent());
    }

    @Test
    void testNullSafety() {
        Message message = new Message();
        message.setContent(null);
        assertNull(message.getContent());
    }
}
