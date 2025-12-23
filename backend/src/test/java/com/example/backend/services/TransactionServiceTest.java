package com.example.backend.services;

import com.example.backend.models.Transaction;
import com.example.backend.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @InjectMocks private TransactionService transactionService;

    private Transaction incomeTx, expenseTx;

    @BeforeEach
    void setUp() {
        incomeTx = new Transaction("u1", "Boss", "Salary",
                new BigDecimal("3000.00"), "INCOME", "Work", false, null);
        incomeTx.setTransactionId("tx1");

        expenseTx = new Transaction("u1", "Shop", "Groceries",
                new BigDecimal("150.00"), "EXPENSE", "Food", false, null);
        expenseTx.setTransactionId("tx2");
    }

    // ---------- Retrieval ----------

    @Test
    void testGetAllTransactionsSuccess() {
        when(transactionRepository.findAll()).thenReturn(List.of(incomeTx, expenseTx));

        List<Transaction> result = transactionService.getAllTransactions();

        assertEquals(2, result.size());
        verify(transactionRepository).findAll();
    }

    @Test
    void testGetTransactionByIdFound() {
        when(transactionRepository.findById("tx1")).thenReturn(Optional.of(incomeTx));

        Optional<Transaction> result = transactionService.getTransactionById("tx1");

        assertTrue(result.isPresent());
        assertEquals("Salary", result.get().getDescription());
    }

    @Test
    void testGetTransactionByIdNotFound() {
        when(transactionRepository.findById("bad")).thenReturn(Optional.empty());

        Optional<Transaction> result = transactionService.getTransactionById("bad");

        assertFalse(result.isPresent());
    }

    // ---------- Create / Update / Delete ----------

    @Test
    void testCreateTransactionValid() {
        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Transaction created = transactionService.createTransaction(incomeTx);

        assertEquals("INCOME", created.getType());
        verify(transactionRepository).save(incomeTx);
    }

    @Test
    void testCreateTransactionInvalidAmountThrows() {
        incomeTx.setAmount(BigDecimal.ZERO);
        assertThrows(RuntimeException.class, () -> transactionService.createTransaction(incomeTx));
    }

    @Test
    void testUpdateTransactionSuccess() {
        when(transactionRepository.existsById("tx1")).thenReturn(true);
        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Transaction result = transactionService.updateTransaction("tx1", expenseTx);

        assertEquals("tx1", result.getTransactionId());
        verify(transactionRepository).save(expenseTx);
    }

    @Test
    void testUpdateTransactionNotFoundThrows() {
        when(transactionRepository.existsById("none")).thenReturn(false);
        assertThrows(RuntimeException.class,
                () -> transactionService.updateTransaction("none", expenseTx));
    }

    @Test
    void testDeleteTransactionSuccess() {
        when(transactionRepository.existsById("tx2")).thenReturn(true);

        transactionService.deleteTransaction("tx2");

        verify(transactionRepository).deleteById("tx2");
    }

    @Test
    void testDeleteTransactionNotFoundThrows() {
        when(transactionRepository.existsById("bad")).thenReturn(false);
        assertThrows(RuntimeException.class, () -> transactionService.deleteTransaction("bad"));
    }

    // ---------- Query by type / category ----------

    @Test
    void testGetTransactionsByType() {
        when(transactionRepository.findByType("INCOME")).thenReturn(List.of(incomeTx));

        List<Transaction> result = transactionService.getTransactionsByType("INCOME");

        assertEquals(1, result.size());
        assertEquals("INCOME", result.get(0).getType());
    }

    @Test
    void testGetTransactionsByCategory() {
        when(transactionRepository.findByCategory("Food")).thenReturn(List.of(expenseTx));

        List<Transaction> result = transactionService.getTransactionsByCategory("Food");

        assertEquals(1, result.size());
        assertEquals("Food", result.get(0).getCategory());
    }

    // ---------- Aggregates ----------

    @Test
    void testGetTotalIncome() {
        when(transactionRepository.findByType("INCOME")).thenReturn(List.of(incomeTx));

        BigDecimal result = transactionService.getTotalIncome();

        assertEquals(new BigDecimal("3000.00"), result);
    }

    @Test
    void testGetTotalExpenses() {
        when(transactionRepository.findByType("EXPENSE")).thenReturn(List.of(expenseTx));

        BigDecimal result = transactionService.getTotalExpenses();

        assertEquals(new BigDecimal("150.00"), result);
    }

    @Test
    void testGetNetAmount() {
        when(transactionRepository.findByType("INCOME")).thenReturn(List.of(incomeTx));
        when(transactionRepository.findByType("EXPENSE")).thenReturn(List.of(expenseTx));

        BigDecimal result = transactionService.getNetAmount();

        assertEquals(new BigDecimal("2850.00"), result);
    }

    // ---------- User & Date filters ----------

    @Test
    void testGetTransactionsByUser() {
        when(transactionRepository.findByUserId("u1")).thenReturn(List.of(incomeTx, expenseTx));

        List<Transaction> result = transactionService.getTransactionsByUser("u1");

        assertEquals(2, result.size());
        verify(transactionRepository).findByUserId("u1");
    }

    @Test
    void testGetTransactionsByDateRange() {
        Date start = new Date();
        Date end = new Date();
        when(transactionRepository.findByUserIdAndCreatedBetween("u1", start, end))
                .thenReturn(List.of(expenseTx));

        List<Transaction> result = transactionService.getTransactionsByDateRange("u1", start, end);

        assertEquals(1, result.size());
        assertEquals("Groceries", result.get(0).getDescription());
    }

    @Test
    void testGetTotalSpendingForPeriod() {
        Date start = new Date();
        Date end = new Date();
        when(transactionRepository.findByUserIdAndCreatedBetween("u1", start, end))
                .thenReturn(List.of(expenseTx, incomeTx));

        BigDecimal result = transactionService.getTotalSpendingForPeriod("u1", start, end);

        assertEquals(new BigDecimal("150.00"), result);
    }

    // ---------- Recurring ----------

    @Test
    void testGetRecurringTransactions() {
        when(transactionRepository.findByUserIdAndIsRecurringTrue("u1"))
                .thenReturn(List.of(expenseTx));

        List<Transaction> result = transactionService.getRecurringTransactions("u1");

        assertEquals(1, result.size());
        verify(transactionRepository).findByUserIdAndIsRecurringTrue("u1");
    }

    @Test
    void testProjectBalance() {
        Transaction recurring = new Transaction("u1", "Netflix", "Sub",
                new BigDecimal("10.00"), "EXPENSE", "Entertainment", true, 30);
        when(transactionRepository.findByUserIdAndIsRecurringTrue("u1"))
                .thenReturn(List.of(recurring));

        BigDecimal result = transactionService.projectBalance("u1", new BigDecimal("100.00"), 3);

        // 100 - (10 * 3) = 70
        assertEquals(new BigDecimal("70.00"), result);
    }

    // ---------- Category + Date ----------

    @Test
    void testGetTotalByCategoryForPeriod() {
        Date start = new Date();
        Date end = new Date();
        when(transactionRepository.findByUserIdAndCategoryAndCreatedBetween("u1", "Food", start, end))
                .thenReturn(List.of(expenseTx));

        BigDecimal result = transactionService.getTotalByCategoryForPeriod("u1", "Food", start, end);

        assertEquals(new BigDecimal("150.00"), result);
    }

    // ---------- Income / Expense by user ----------

    @Test
    void testGetTotalIncomeByUser() {
        when(transactionRepository.findByUserIdAndType("u1", "INCOME"))
                .thenReturn(List.of(incomeTx));

        BigDecimal result = transactionService.getTotalIncomeByUser("u1");

        assertEquals(new BigDecimal("3000.00"), result);
    }

    @Test
    void testGetTotalExpensesByUser() {
        when(transactionRepository.findByUserIdAndType("u1", "EXPENSE"))
                .thenReturn(List.of(expenseTx));

        BigDecimal result = transactionService.getTotalExpensesByUser("u1");

        assertEquals(new BigDecimal("150.00"), result);
    }
}
