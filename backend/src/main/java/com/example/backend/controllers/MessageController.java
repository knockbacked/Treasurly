package com.example.backend.controllers;

import com.example.backend.models.Message;
import com.example.backend.repositories.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class MessageController {

    private final MessageRepository repo;

    public MessageController(MessageRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Message> getMessages() {
        return repo.findAll();
    }

    @PostMapping
    public Message addMessage(@RequestBody Message message) {
        return repo.save(message);
    }
}
