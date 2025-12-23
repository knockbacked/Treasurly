package com.example.backend.controllers;

import com.example.backend.models.User;
import com.example.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    // sign up a new user
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signupUser(@RequestBody Map<String, String> req, HttpSession session) {
        try {
            String firstname = req.get("firstname");
            String lastname = req.get("lastname");
            String email = req.get("email");
            String password = req.get("password");

            if (password == null || password.length() < 8 || !password.matches(".*\\d.*")) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Password must be at least 8 characters long and contain at least one number.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            User user = userService.signupUser(firstname, lastname, email, password);
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", Map.of(
                "id", user.getId(),
                "firstname", user.getFirstName(),
                "lastname", user.getLastName(),
                "email", user.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // check login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> req, HttpSession session) {
        try {
            String email = req.get("email");
            String password = req.get("password");

            User user = userService.loginUser(email, password);
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user", Map.of(
                "id", user.getId(),
                "firstname", user.getFirstName(),
                "lastname", user.getLastName(),
                "email", user.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // logout user
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logoutUser(HttpSession session) {
        session.invalidate();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    // get current user info
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        
        if (authenticated == null || !authenticated) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = (User) session.getAttribute("user");
        Map<String, Object> response = new HashMap<>();
        response.put("user", Map.of(
            "id", user.getId(),
            "firstname", user.getFirstName(),
            "lastname", user.getLastName(),
            "email", user.getEmail()
        ));

        return ResponseEntity.ok(response);
    }

    // check authentication status
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authenticated != null && authenticated);
        
        return ResponseEntity.ok(response);
    }
}
