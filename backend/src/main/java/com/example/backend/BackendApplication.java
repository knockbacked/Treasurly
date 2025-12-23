package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.example.backend.models.Message;
import com.example.backend.repositories.MessageRepository;


@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		var context = SpringApplication.run(BackendApplication.class, args);
		MessageRepository messageRepository = context.getBean(MessageRepository.class);
		Message testMsg = new Message("This is a test msg in main");
		messageRepository.save(testMsg);
		System.out.println("Test message saved: " + testMsg);
	}

}
