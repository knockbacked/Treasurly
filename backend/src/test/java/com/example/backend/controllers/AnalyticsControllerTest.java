package com.example.backend.controllers;

import com.example.backend.models.User;
import com.example.backend.services.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false) // disable Spring Security filters for this test
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    private BigDecimal income;
    private BigDecimal expenses;
    private BigDecimal net;
    private BigDecimal projected;

    @BeforeEach
    void setUp() {
        income = new BigDecimal("5000.00");
        expenses = new BigDecimal("2000.00");
        net = income.subtract(expenses);
        projected = new BigDecimal("8000.00");

        Mockito.when(transactionService.getTotalIncomeByUser(anyString())).thenReturn(income);
        Mockito.when(transactionService.getTotalExpensesByUser(anyString())).thenReturn(expenses);
        Mockito.when(transactionService.projectBalance(anyString(), Mockito.any(BigDecimal.class), Mockito.eq(3)))
                .thenReturn(projected);
    }

    // ---------- /summary/{userId} ----------
    @Test
    void testGetSummaryByUserId_Success() throws Exception {
        mockMvc.perform(get("/api/analytics/summary/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income", is(5000.00)))
                .andExpect(jsonPath("$.expenses", is(2000.00)))
                .andExpect(jsonPath("$.net", is(3000.00)))
                .andExpect(jsonPath("$.projectedSpending", is(8000.00)));
    }

    // ---------- /summary (current user) ----------
    @Test
    void testGetSummaryForCurrentUser_Authenticated() throws Exception {
        User mockUser = new User("John", "Doe", "john@example.com", "pass1234");
        mockUser.setId("u1");

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("user", mockUser);

        mockMvc.perform(get("/api/analytics/summary").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income", is(5000.00)))
                .andExpect(jsonPath("$.expenses", is(2000.00)))
                .andExpect(jsonPath("$.net", is(3000.00)))
                .andExpect(jsonPath("$.projectedSpending", is(8000.00)));
    }

    @Test
    void testGetSummaryForCurrentUser_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isUnauthorized());
    }
}
