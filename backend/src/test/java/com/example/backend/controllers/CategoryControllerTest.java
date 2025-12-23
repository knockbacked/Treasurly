package com.example.backend.controllers;

import com.example.backend.models.Category;
import com.example.backend.repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false) // disable security filters
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryRepository categoryRepository;

    private Category foodCategory;

    @BeforeEach
    void setUp() {
        foodCategory = new Category("Food", "#FF0000", "🍔");
        foodCategory.setId("1");
    }

    // ---------- GET ALL ----------
    @Test
    void testGetAllCategories() throws Exception {
        Mockito.when(categoryRepository.findAll()).thenReturn(List.of(foodCategory));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Food")))
                .andExpect(jsonPath("$[0].color", is("#FF0000")))
                .andExpect(jsonPath("$[0].icon", is("🍔")));
    }

    // ---------- GET BY ID ----------
    @Test
    void testGetCategoryById_Found() throws Exception {
        Mockito.when(categoryRepository.findById("1")).thenReturn(Optional.of(foodCategory));

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Food")));
    }

    @Test
    void testGetCategoryById_NotFound() throws Exception {
        Mockito.when(categoryRepository.findById("999")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/categories/999"))
                .andExpect(status().isNotFound());
    }

    // ---------- CREATE ----------
    @Test
    void testCreateCategory() throws Exception {
        Mockito.when(categoryRepository.save(any(Category.class))).thenReturn(foodCategory);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Food",
                                    "color": "#FF0000",
                                    "icon": "🍔"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Food")))
                .andExpect(jsonPath("$.icon", is("🍔")));
    }

    // ---------- UPDATE ----------
    @Test
    void testUpdateCategory_Found() throws Exception {
        Mockito.when(categoryRepository.existsById("1")).thenReturn(true);
        Mockito.when(categoryRepository.save(any(Category.class))).thenReturn(foodCategory);

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Updated Food",
                                    "color": "#00FF00",
                                    "icon": "🥗"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Food"))); // returns mocked category
    }

    @Test
    void testUpdateCategory_NotFound() throws Exception {
        Mockito.when(categoryRepository.existsById("1")).thenReturn(false);

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Missing",
                                    "color": "#000000",
                                    "icon": "❌"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    // ---------- DELETE ----------
    @Test
    void testDeleteCategory_Found() throws Exception {
        Mockito.when(categoryRepository.existsById("1")).thenReturn(true);
        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteCategory_NotFound() throws Exception {
        Mockito.when(categoryRepository.existsById("1")).thenReturn(false);
        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isNotFound());
    }
}
