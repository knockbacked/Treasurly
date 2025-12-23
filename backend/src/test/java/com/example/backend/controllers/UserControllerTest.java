package com.example.backend.controllers;

import com.example.backend.models.User;
import com.example.backend.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("John", "Doe", "john@example.com", "password123");
        sampleUser.setId("user123");
    }

    // ---------- SIGNUP ----------
    @Test
    void testSignupUser_Success() throws Exception {
        Mockito.when(userService.signupUser(any(), any(), any(), any())).thenReturn(sampleUser);

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstname": "John",
                                    "lastname": "Doe",
                                    "email": "john@example.com",
                                    "password": "password1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Registration successful")))
                .andExpect(jsonPath("$.user.firstname", is("John")))
                .andExpect(jsonPath("$.user.email", is("john@example.com")));
    }

    @Test
    void testSignupUser_InvalidPassword() throws Exception {
        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstname": "John",
                                    "lastname": "Doe",
                                    "email": "john@example.com",
                                    "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Password must be at least 8")));
    }

    // ---------- LOGIN ----------
    @Test
    void testLoginUser_Success() throws Exception {
        Mockito.when(userService.loginUser(eq("john@example.com"), eq("password123"))).thenReturn(sampleUser);

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "john@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Login successful")))
                .andExpect(jsonPath("$.user.firstname", is("John")));
    }

    @Test
    void testLoginUser_InvalidCredentials() throws Exception {
        Mockito.when(userService.loginUser(any(), any())).thenThrow(new RuntimeException("Invalid email or password."));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "wrong@example.com",
                                    "password": "wrongpass"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Invalid email or password.")));
    }

    // ---------- LOGOUT ----------
    @Test
    void testLogoutUser() throws Exception {
        mockMvc.perform(post("/api/users/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Logout successful")));
    }

    // ---------- ME ----------
    @Test
    void testGetCurrentUser_Authenticated() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("authenticated", true);
        session.setAttribute("user", sampleUser);

        mockMvc.perform(get("/api/users/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email", is("john@example.com")));
    }

    @Test
    void testGetCurrentUser_NotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Not authenticated")));
    }

    // ---------- CHECK ----------
    @Test
    void testCheckAuthStatus_True() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("authenticated", true);

        mockMvc.perform(get("/api/users/check").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated", is(true)));
    }

    @Test
    void testCheckAuthStatus_False() throws Exception {
        mockMvc.perform(get("/api/users/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated", is(false)));
    }
}
