package com.example.backend.services;

import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;

    private BCryptPasswordEncoder encoder;

    @BeforeEach
    void setUp() {
        encoder = new BCryptPasswordEncoder();
    }

    // ---------- signupUser ----------

    @Test
    void testSignupUserSuccess() {
        when(userRepository.existsByEmail("a@mail.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        User result = userService.signupUser("Alice", "Smith",
                "a@mail.com", "mypassword");

        assertEquals("Alice", result.getFirstName());
        assertEquals("Smith", result.getLastName());
        assertEquals("a@mail.com", result.getEmail());
        assertTrue(encoder.matches("mypassword", result.getPassword()),
                "Password should be hashed with BCrypt");
        verify(userRepository).save(result);
    }

    @Test
    void testSignupUserEmailAlreadyExistsThrows() {
        when(userRepository.existsByEmail("a@mail.com")).thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> userService.signupUser("A", "B", "a@mail.com", "x"));
    }

    // ---------- loginUser ----------

    @Test
    void testLoginUserSuccess() {
        User existing = new User("Elvis", "Nguyen",
                "elvis@mail.com", encoder.encode("secret"));
        when(userRepository.findByEmail("elvis@mail.com"))
                .thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        User loggedIn = userService.loginUser("elvis@mail.com", "secret");

        assertEquals(existing, loggedIn);
        assertNotNull(loggedIn.getLastLogin(), "lastLogin should be updated");
        verify(userRepository).save(existing);
    }

    @Test
    void testLoginUserEmailNotFoundThrows() {
        when(userRepository.findByEmail("ghost@mail.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> userService.loginUser("ghost@mail.com", "123"));
    }

    @Test
    void testLoginUserInvalidPasswordThrows() {
        User existing = new User("E", "N", "e@mail.com",
                encoder.encode("rightpass"));
        when(userRepository.findByEmail("e@mail.com"))
                .thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class,
                () -> userService.loginUser("e@mail.com", "wrongpass"));
    }

    // ---------- findUserByEmail ----------

    @Test
    void testFindUserByEmailFound() {
        User u = new User("John", "Doe", "j@mail.com", "pw");
        when(userRepository.findByEmail("j@mail.com")).thenReturn(Optional.of(u));

        Optional<User> result = userService.findUserByEmail("j@mail.com");

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getFirstName());
    }

    @Test
    void testFindUserByEmailNotFound() {
        when(userRepository.findByEmail("none@mail.com")).thenReturn(Optional.empty());
        Optional<User> result = userService.findUserByEmail("none@mail.com");
        assertTrue(result.isEmpty());
    }
}
