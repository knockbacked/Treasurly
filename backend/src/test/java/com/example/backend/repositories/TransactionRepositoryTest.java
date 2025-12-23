package com.example.backend.repositories;

import com.example.backend.models.Transaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.annotation.DirtiesContext;

import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    private Transaction incomeTx, expenseTx, recurringTx;
    private Date now, lastWeek, nextWeek;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();

        Calendar cal = Calendar.getInstance();
        now = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, -7);
        lastWeek = cal.getTime();
        cal.add(Calendar.DAY_OF_MONTH, 14);
        nextWeek = cal.getTime();

        incomeTx = new Transaction("u1", "Company", "Salary",
                new BigDecimal("5000.00"), "INCOME", "Work", false, null);
        incomeTx.setCreated(now);

        expenseTx = new Transaction("u1", "Store", "Groceries",
                new BigDecimal("200.00"), "EXPENSE", "Food", false, null);
        expenseTx.setCreated(now);

        recurringTx = new Transaction("u1", "Netflix", "Subscription",
                new BigDecimal("15.00"), "EXPENSE", "Entertainment", true, 30);
        recurringTx.setCreated(now);

        transactionRepository.saveAll(List.of(incomeTx, expenseTx, recurringTx));
    }

    // ---------- Type & Category ----------
    @Test
    void testFindByType() {
        List<Transaction> result = transactionRepository.findByType("INCOME");
        assertEquals(1, result.size());
        assertEquals("Company", result.get(0).getTarget());
    }

    @Test
    void testFindByCategory() {
        List<Transaction> result = transactionRepository.findByCategory("Food");
        assertEquals(1, result.size());
        assertEquals("Groceries", result.get(0).getDescription());
    }

    @Test
    void testFindByTypeAndCategory() {
        List<Transaction> result = transactionRepository.findByTypeAndCategory("EXPENSE", "Food");
        assertEquals(1, result.size());
    }

    // ---------- User filters ----------
    @Test
    void testFindByUserId() {
        List<Transaction> result = transactionRepository.findByUserId("u1");
        assertEquals(3, result.size());
    }

    @Test
    void testFindByUserIdAndCategory() {
        List<Transaction> result = transactionRepository.findByUserIdAndCategory("u1", "Entertainment");
        assertEquals(1, result.size());
        assertEquals("Netflix", result.get(0).getTarget());
    }

    @Test
    void testFindByUserIdAndCreatedBetween() {
        List<Transaction> result = transactionRepository.findByUserIdAndCreatedBetween("u1", lastWeek, nextWeek);
        assertEquals(3, result.size());
    }

    @Test
    void testFindByCreatedBetween() {
        List<Transaction> result = transactionRepository.findByCreatedBetween(lastWeek, nextWeek);
        assertEquals(3, result.size());
    }

    @Test
    void testFindByUserIdAndCreatedAfter() {
        List<Transaction> result = transactionRepository.findByUserIdAndCreatedAfter("u1", lastWeek);
        assertEquals(3, result.size());
    }

    // ---------- Amount filters ----------

//    @Test
//    void testFindByUserIdAndAmountGreaterThan() {
//        List<Transaction> result = transactionRepository.findByUserIdAndAmountGreaterThan("u1", new BigDecimal("100.00"));
//        assertEquals(2, result.size()); // ✅ 5000 and 200
//    }

    @Test
    void testFindByUserIdAndAmountLessThanEqual() {
        List<Transaction> result = transactionRepository.findByUserIdAndAmountLessThanEqual("u1", new BigDecimal("200.00"));
        assertEquals(2, result.size()); // ✅ 200 and 15
    }

    // ---------- Recurring ----------
    @Test
    void testFindByUserIdAndIsRecurringTrue() {
        List<Transaction> result = transactionRepository.findByUserIdAndIsRecurringTrue("u1");
        assertEquals(1, result.size());
        assertTrue(result.get(0).isRecurring());
    }

    // ---------- Sorting ----------
    @Test
    void testFindByUserIdOrderByCreatedDesc() {
        List<Transaction> result = transactionRepository.findByUserIdOrderByCreatedDesc("u1");
        assertFalse(result.isEmpty());
        assertTrue(result.get(0).getCreated().compareTo(result.get(result.size() - 1).getCreated()) >= 0);
    }

    // ---------- Combination query ----------
    @Test
    void testFindByUserIdAndCategoryAndCreatedBetween() {
        List<Transaction> result = transactionRepository.findByUserIdAndCategoryAndCreatedBetween("u1", "Food", lastWeek, nextWeek);
        assertEquals(1, result.size());
        assertEquals("Groceries", result.get(0).getDescription());
    }

    @Test
    void testFindByUserIdAndType() {
        List<Transaction> result = transactionRepository.findByUserIdAndType("u1", "INCOME");
        assertEquals(1, result.size());
        assertEquals("Company", result.get(0).getTarget());
    }
}
