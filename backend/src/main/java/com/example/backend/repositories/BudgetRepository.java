package com.example.backend.repositories;

import com.example.backend.models.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {
    
    List<Budget> findByUserId(String userId);
    List<Budget> findByUserIdAndName(String userId, String name);
    List<Budget> findByUserIdAndCreatedAtAfter(String userId, java.time.LocalDateTime createdAt);
    List<Budget> findByUserIdOrderByUpdatedAtDesc(String userId);
    boolean existsByUserIdAndName(String userId, String name);
}