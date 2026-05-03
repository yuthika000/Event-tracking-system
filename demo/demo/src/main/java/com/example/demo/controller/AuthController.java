package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.User;
import com.example.demo.model.Student;
import com.example.demo.model.Advisor;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.AdvisorRepository;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository userRepo;
    private final StudentRepository studentRepo;
    private final AdvisorRepository advisorRepo;

    public AuthController(UserRepository userRepo, StudentRepository studentRepo, AdvisorRepository advisorRepo) {
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
        this.advisorRepo = advisorRepo;
    }

    // DTO for Signup
    public static class SignupRequest {
        public String username;
        public String password;
        public String role;
        public String name;
        public String registerNumber;
        public String department;
        public String year;
        public String parentPhoneNumber;
        public String email;
    }

    // Student signup
    @PostMapping("/signup")
    public User signup(@RequestBody SignupRequest request) {
        // 1. Create User
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(request.password);
        user.setRole("STUDENT"); // Force role for this endpoint or use request.role
        User savedUser = userRepo.save(user);

        // 2. Create Student if role is STUDENT
        if ("STUDENT".equalsIgnoreCase(savedUser.getRole())) {
            Student student = new Student();
            student.setName(request.name);
            student.setRegisterNumber(request.registerNumber);
            student.setDepartment(request.department);
            student.setYear(request.year);
            student.setParentPhoneNumber(request.parentPhoneNumber);
            student.setEmail(request.email);
            student.setUser(savedUser);
            studentRepo.save(student);
        }

        return savedUser;
    }

    // Advisor signup
    @PostMapping("/advisor/signup")
    public User advisorSignup(@RequestBody Map<String, String> request) {
        // 1. Create User
        User user = new User();
        user.setUsername(request.get("email")); // Use email as username
        user.setPassword(request.get("password"));
        user.setRole("ADVISOR");
        User savedUser = userRepo.save(user);

        // 2. Create Advisor
        Advisor advisor = new Advisor();
        advisor.setName(request.get("name"));
        advisor.setEmail(request.get("email"));
        advisor.setPassword(request.get("password"));
        advisor.setUser(savedUser);
        advisorRepo.save(advisor);

        return savedUser;
    }

    // Login for all roles
    @PostMapping("/login")
    public Object login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String parentPhone = request.get("parentPhoneNumber");

        User existingUser = userRepo.findByUsername(username);

        if (existingUser != null &&
                existingUser.getPassword().equals(password)) {

            if ("STUDENT".equalsIgnoreCase(existingUser.getRole())) {
                Student s = studentRepo.findByUser_Id(existingUser.getId());

                // If phone provided during login, update it
                if (s != null && parentPhone != null && !parentPhone.isEmpty()) {
                    s.setParentPhoneNumber(parentPhone);
                    s = studentRepo.save(s);
                }

                Map<String, Object> resp = new HashMap<>();
                resp.put("id", existingUser.getId());
                resp.put("username", existingUser.getUsername());
                resp.put("role", existingUser.getRole());
                if (s != null) {
                    resp.put("parentPhoneNumber", s.getParentPhoneNumber());
                    resp.put("name", s.getName());
                    resp.put("registerNumber", s.getRegisterNumber());
                    resp.put("email", s.getEmail());
                }
                return resp;
            } else if ("ADVISOR".equalsIgnoreCase(existingUser.getRole())) {
                Advisor a = advisorRepo.findByUser_Id(existingUser.getId());

                Map<String, Object> resp = new HashMap<>();
                resp.put("id", existingUser.getId());
                resp.put("username", existingUser.getUsername());
                resp.put("role", existingUser.getRole());
                if (a != null) {
                    resp.put("name", a.getName());
                    resp.put("email", a.getEmail());
                }
                return resp;
            }
            return existingUser;
        }

        return null; // frontend handles invalid login
    }
}