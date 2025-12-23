package com.example.backend.services;

import com.example.backend.models.User;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.logging.Logger;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    private static final Logger logger = Logger.getLogger(UserService.class.getName());
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    private String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }


    public User signupUser(String firstname, String lastname, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered.");
        }
        User user = new User(firstname, lastname, email, hashPassword(password));
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password.");
        }

        User user = userOpt.get();
        
        if (!verifyPassword(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
