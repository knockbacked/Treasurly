package com.example.backend.controllers;

import com.example.backend.models.Transaction;
import com.example.backend.services.TransactionService;
import com.example.backend.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable Spring Security filters for isolated controller testing
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    private Transaction tx1;
    private Transaction tx2;

    @BeforeEach
    void setup() {
        tx1 = new Transaction("user1", "Target1", "Desc1",
                new BigDecimal("100.00"), "INCOME", "Salary", false, null);
        tx1.setTransactionId("t1");

        tx2 = new Transaction("user1", "Target2", "Desc2",
                new BigDecimal("50.00"), "EXPENSE", "Food", false, null);
        tx2.setTransactionId("t2");
    }

    // ---------- GET ALL ----------
    @Test
    void testGetAllTransactions() throws Exception {
        Mockito.when(transactionService.getAllTransactions()).thenReturn(List.of(tx1, tx2));

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].type", is("INCOME")))
                .andExpect(jsonPath("$[1].type", is("EXPENSE")));
    }

    // ---------- GET BY ID ----------
    @Test
    void testGetTransactionById_Found() throws Exception {
        Mockito.when(transactionService.getTransactionById("t1")).thenReturn(Optional.of(tx1));

        mockMvc.perform(get("/api/transactions/t1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId", is("t1")))
                .andExpect(jsonPath("$.type", is("INCOME")));
    }

    @Test
    void testGetTransactionById_NotFound() throws Exception {
        Mockito.when(transactionService.getTransactionById("missing"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/transactions/missing"))
                .andExpect(status().isNotFound());
    }

    // ---------- CREATE ----------
    @Test
    void testCreateTransaction() throws Exception {
        Mockito.when(transactionService.createTransaction(Mockito.<Transaction>any()))
                .thenReturn(tx1);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "user1",
                                  "target": "Target1",
                                  "description": "Desc1",
                                  "amount": 100.00,
                                  "type": "INCOME",
                                  "category": "Salary"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type", is("INCOME")))
                .andExpect(jsonPath("$.category", is("Salary")));
    }

    // ---------- UPDATE ----------
    @Test
    void testUpdateTransaction() throws Exception {
        Mockito.when(transactionService.updateTransaction(eq("t1"), Mockito.<Transaction>any()))
                .thenReturn(tx1);

        mockMvc.perform(put("/api/transactions/t1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "user1",
                                  "target": "Target1",
                                  "description": "Updated",
                                  "amount": 120.00,
                                  "type": "INCOME",
                                  "category": "Salary"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId", is("t1")));
    }

    // ---------- DELETE ----------
    @Test
    void testDeleteTransaction() throws Exception {
        doNothing().when(transactionService).deleteTransaction("t1");

        mockMvc.perform(delete("/api/transactions/t1"))
                .andExpect(status().isNoContent());
    }

    // ---------- FILTERS ----------
    @Test
    void testGetTransactionsByType() throws Exception {
        Mockito.when(transactionService.getTransactionsByType("INCOME")).thenReturn(List.of(tx1));

        mockMvc.perform(get("/api/transactions/type/INCOME"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type", is("INCOME")));
    }

    @Test
    void testGetTransactionsByCategory() throws Exception {
        Mockito.when(transactionService.getTransactionsByCategory("Food")).thenReturn(List.of(tx2));

        mockMvc.perform(get("/api/transactions/category/Food"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category", is("Food")));
    }

    @Test
    void testGetTransactionsByUser() throws Exception {
        Mockito.when(transactionService.getTransactionsByUser("user1")).thenReturn(List.of(tx1, tx2));

        mockMvc.perform(get("/api/transactions/user/user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}
