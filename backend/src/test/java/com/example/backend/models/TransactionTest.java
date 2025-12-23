package com.example.backend.models;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class TransactionTest {

    @Test
    void testDefaultConstructorInitializesDate() {
        Transaction transaction = new Transaction();

        assertNotNull(transaction.getCreated(), "Created date should be initialized by default constructor");
        assertTrue(transaction.getCreated().before(new Date(System.currentTimeMillis() + 1000)),
                "Created date should be close to current time");

        // All other fields should be null or default
        assertNull(transaction.getUserId());
        assertNull(transaction.getTarget());
        assertNull(transaction.getDescription());
        assertNull(transaction.getAmount());
        assertNull(transaction.getType());
        assertNull(transaction.getCategory());
        assertFalse(transaction.isRecurring());
        assertNull(transaction.getRecurringRate());
    }

    @Test
    void testParameterizedConstructorSetsAllFields() {
        BigDecimal amount = new BigDecimal("250.75");
        Transaction t = new Transaction(
                "user123",
                "Amazon",
                "Online purchase",
                amount,
                "EXPENSE",
                "Shopping",
                true,
                30
        );

        assertEquals("user123", t.getUserId());
        assertEquals("Amazon", t.getTarget());
        assertEquals("Online purchase", t.getDescription());
        assertEquals(amount, t.getAmount());
        assertEquals("EXPENSE", t.getType());
        assertEquals("Shopping", t.getCategory());
        assertTrue(t.isRecurring());
        assertEquals(30, t.getRecurringRate());
        assertNotNull(t.getCreated());
    }

    @Test
    void testGettersAndSetters() {
        Transaction t = new Transaction();

        Date now = new Date();
        t.setTransactionId("tx001");
        t.setUserId("user456");
        t.setTarget("Netflix");
        t.setDescription("Monthly subscription");
        t.setAmount(new BigDecimal("15.99"));
        t.setType("EXPENSE");
        t.setCategory("Entertainment");
        t.setCreated(now);
        t.setRecurring(true);
        t.setRecurringRate(30);

        assertEquals("tx001", t.getTransactionId());
        assertEquals("user456", t.getUserId());
        assertEquals("Netflix", t.getTarget());
        assertEquals("Monthly subscription", t.getDescription());
        assertEquals(new BigDecimal("15.99"), t.getAmount());
        assertEquals("EXPENSE", t.getType());
        assertEquals("Entertainment", t.getCategory());
        assertEquals(now, t.getCreated());
        assertTrue(t.isRecurring());
        assertEquals(30, t.getRecurringRate());
    }

    @Test
    void testMutability() {
        Transaction t = new Transaction();
        t.setUserId("user1");
        t.setUserId("user2"); // overwrite
        assertEquals("user2", t.getUserId());
    }

    @Test
    void testNullSafety() {
        Transaction t = new Transaction();
        t.setDescription(null);
        t.setCategory(null);
        t.setAmount(null);
        t.setRecurringRate(null);

        assertNull(t.getDescription());
        assertNull(t.getCategory());
        assertNull(t.getAmount());
        assertNull(t.getRecurringRate());
    }
}
