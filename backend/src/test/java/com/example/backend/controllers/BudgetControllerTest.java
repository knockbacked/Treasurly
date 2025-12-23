
package com.example.backend.controllers;

import com.example.backend.models.Budget;
import com.example.backend.services.BudgetService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

@WebMvcTest(BudgetController.class)
@AutoConfigureMockMvc(addFilters = false)
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BudgetService budgetService;

    @Test
    void addItemToBudget_shouldReturnOk() throws Exception {
        Mockito.when(budgetService.addItemToBudget(Mockito.eq("b1"), Mockito.eq("c1"), Mockito.eq(new BigDecimal("100.00")), Mockito.eq(1)))
                .thenReturn(new Budget());

        mockMvc.perform(post("/api/budgets/b1/items")
                        .param("categoryId", "c1")
                        .param("amount", "100.00")
                        .param("frequency", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void removeItemFromBudget_shouldReturnOk() throws Exception {
        Mockito.when(budgetService.removeItemFromBudget("b1", "c1")).thenReturn(new Budget());

        mockMvc.perform(delete("/api/budgets/b1/items/c1"))
                .andExpect(status().isOk());
    }
}
