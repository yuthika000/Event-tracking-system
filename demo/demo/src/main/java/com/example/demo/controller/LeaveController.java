package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.LeaveRequest;
import com.example.demo.model.Student;
import com.example.demo.model.Advisor;
import com.example.demo.repository.LeaveRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.service.EmailService;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin("*")
public class LeaveController {

    private final LeaveRepository leaveRepository;
    private final StudentRepository studentRepository;
    private final AdvisorRepository advisorRepository;
    private final EmailService emailService;

    public LeaveController(LeaveRepository leaveRepository,
            StudentRepository studentRepository,
            AdvisorRepository advisorRepository,
            EmailService emailService) {
        this.leaveRepository = leaveRepository;
        this.studentRepository = studentRepository;
        this.advisorRepository = advisorRepository;
        this.emailService = emailService;
    }

    @GetMapping("/advisors")
    public List<Advisor> getAllAdvisors() {
        return advisorRepository.findAll();
    }

    @GetMapping("/advisor/by-user/{userId}")
    public Advisor getAdvisorByUserId(@PathVariable String userId) {
        return advisorRepository.findByUser_Id(userId);
    }

    @PostMapping("/apply")
    public String applyLeave(
            @RequestParam String category,
            @RequestParam String reason,
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam String userId,
            @RequestParam(required = false) String advisorId) {

        Student student = studentRepository.findByUser_Id(userId);
        if (student == null) {
            return "Error: Student profile not found for User ID " + userId;
        }

        LocalDate from = LocalDate.parse(fromDate);
        LocalDate to = LocalDate.parse(toDate);
        LocalDate today = LocalDate.now();

        if (from.isBefore(today)) {
            return "Error: Start date cannot be in the past.";
        }
        if (to.isBefore(from)) {
            return "Error: End date cannot be before start date.";
        }

        LeaveRequest leave = new LeaveRequest();
        leave.setStudent(student);
        
        // Set advisor if provided
        if (advisorId != null && !advisorId.isEmpty()) {
            Advisor advisor = advisorRepository.findById(advisorId).orElse(null);
            leave.setAdvisor(advisor);
        }
        
        leave.setUsername(student.getUser().getUsername());
        leave.setCategory(category);
        leave.setReason(reason);
        leave.setFromDate(from);
        leave.setToDate(to);
        leave.setStatus("Pending Advisor");

        leaveRepository.save(leave);

        return "Leave Applied Successfully";
    }

    @PutMapping("/{id}/status")
    public LeaveRequest updateStatus(
            @PathVariable String id,
            @RequestParam String status) {

        return leaveRepository.findById(id).map(leave -> {
            System.out.println("Updating Leave ID: " + id + " to Status: " + status);
            leave.setStatus(status);
            LeaveRequest saved = leaveRepository.save(leave);

            System.out.println("Saved Status: " + saved.getStatus());

            // If request is fully approved, send email notification
            if ("Approved".equalsIgnoreCase(status)) {
                System.out.println("Status is 'Approved'. Sending email notification...");
                Student student = saved.getStudent();
                if (student != null && student.getEmail() != null && !student.getEmail().isEmpty()) {
                    emailService.sendLeaveApprovalEmail(saved, student);
                } else {
                    System.err.println("Cannot send email: Student or email not found");
                }
            }

            return saved;
        }).orElseThrow(() -> new RuntimeException("Leave request not found"));
    }

    @DeleteMapping("/{id}")
    public String deleteLeave(@PathVariable String id) {
        if (leaveRepository.existsById(id)) {
            leaveRepository.deleteById(id);
            return "Leave Request Deleted Successfully";
        } else {
            return "Error: Leave Request not found";
        }
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAllLeaves() {
        return leaveRepository.findAll();
    }

    @GetMapping("/advisor/{advisorId}")
    public List<LeaveRequest> getLeavesByAdvisor(@PathVariable String advisorId) {
        return leaveRepository.findByAdvisor_Id(advisorId);
    }
}
