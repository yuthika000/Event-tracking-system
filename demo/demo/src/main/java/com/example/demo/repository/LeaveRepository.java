package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.LeaveRequest;

import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRepository extends MongoRepository<LeaveRequest, String> {

    List<LeaveRequest> findByAdvisor_Id(String advisorId);
    List<LeaveRequest> findByStudent_Id(String studentId);

}

