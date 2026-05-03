package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.model.Advisor;

public interface AdvisorRepository extends MongoRepository<Advisor, String> {
    Advisor findByUser_Id(String userId);

    Advisor findByEmail(String email);
}
