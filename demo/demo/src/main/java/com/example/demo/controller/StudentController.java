package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.LeaveRepository;
import com.example.demo.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private LeaveRepository leaveRepository;
    
    // Get student profile by user ID
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Student> getStudentProfile(@PathVariable String userId) {
        Student student = studentRepository.findByUser_Id(userId);
        if (student != null) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Get student's leave requests
    @GetMapping("/profile/{userId}/requests")
    public ResponseEntity<List<LeaveRequest>> getStudentLeaveRequests(@PathVariable String userId) {
        Student student = studentRepository.findByUser_Id(userId);
        if (student != null) {
            List<LeaveRequest> requests = leaveRepository.findByStudent_Id(student.getId());
            return ResponseEntity.ok(requests);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Update student profile
    @PutMapping("/profile/{userId}")
    public ResponseEntity<Student> updateStudentProfile(@PathVariable String userId, @RequestBody Student updatedStudent) {
        Student existingStudent = studentRepository.findByUser_Id(userId);
        if (existingStudent != null) {
            // Update allowed fields
            existingStudent.setName(updatedStudent.getName());
            existingStudent.setEmail(updatedStudent.getEmail());
            existingStudent.setParentPhoneNumber(updatedStudent.getParentPhoneNumber());
            existingStudent.setDepartment(updatedStudent.getDepartment());
            existingStudent.setYear(updatedStudent.getYear());
            
            Student savedStudent = studentRepository.save(existingStudent);
            return ResponseEntity.ok(savedStudent);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Upload profile picture
    @PostMapping("/profile/{userId}/picture")
    public ResponseEntity<String> uploadProfilePicture(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            Student student = studentRepository.findByUser_Id(userId);
            if (student == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }
            
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/profile-pictures/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            // Update student profile with picture URL
            String pictureUrl = "/uploads/profile-pictures/" + filename;
            student.setProfilePictureUrl(pictureUrl);
            studentRepository.save(student);
            
            return ResponseEntity.ok(pictureUrl);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }
}
