package com.example.backend.repositories;

import com.example.backend.models.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    //these work by the springboot. you can just do findBy and it makes SQLesque queries.
    List<Transaction> findByType(String type);
    List<Transaction> findByCategory(String category);
    List<Transaction> findByTypeAndCategory(String type, String category);

    // user queries monthly summaries, comparing months, filtering spending by category 
    List<Transaction> findByUserId(String userID);
    List<Transaction> findByUserIdAndCategory(String userID, String category);
    List<Transaction> findByUserIdAndCreatedBetween(String userID, Date start, Date end);

    // time based queries : monthly/weekly reports, projections of future balances 

    List<Transaction> findByCreatedBetween(Date start, Date end);
    List<Transaction> findByUserIdAndCreatedAfter(String userID, Date date);


    // Amount filter : alerts on large transactions, filtering high value spending 
    List<Transaction> findByUserIdAndAmountGreaterThan(String userID, BigDecimal amount);
    List<Transaction> findByUserIdAndAmountLessThanEqual(String userID, BigDecimal amount);

    // Reccuring transactions : listing subs, projecting recurring expensies 
    List<Transaction> findByUserIdAndIsRecurringTrue(String userID);

    // Sorting: show latest transactions first in UI 
    List<Transaction> findByUserIdOrderByCreatedDesc(String userID);

    // Combination queries
    // Useful for "How much did I spend on groceries this month"
    List<Transaction> findByUserIdAndCategoryAndCreatedBetween(
    String userID, String category, Date start, Date end
    );

    List<Transaction> findByUserIdAndType(String userId, String type);



    
}
