package com.example.backend.config;

import com.example.backend.models.Category;
import com.example.backend.repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;

import static org.mockito.Mockito.*;

class DataInitializerTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRunCreatesDataWhenEmpty() throws Exception {
        when(categoryRepository.count()).thenReturn(0L);

        dataInitializer.run();

        // Should seed categories because 0 != 12
        verify(categoryRepository, atLeastOnce()).save(any(Category.class));
    }

    @Test
    void testRunCreatesDataWhenCountIsNotExpected() throws Exception {
        when(categoryRepository.count()).thenReturn(5L); // not equal to 12

        dataInitializer.run();

        // Should still seed because 5 != 12
        verify(categoryRepository, atLeastOnce()).save(any(Category.class));
    }

    @Test
    void testRunDoesNothingWhenCountEqualsExpected() throws Exception {
        when(categoryRepository.count()).thenReturn(12L);

        dataInitializer.run();

        // Should skip seeding because count == 12
        verify(categoryRepository, never()).save(any(Category.class));
    }
}
