package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.example.demo.model.LeaveRequest;
import com.example.demo.model.Student;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendLeaveApprovalEmail(LeaveRequest leaveRequest, Student student) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(student.getEmail());
            message.setSubject("Leave Request Approved");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Your leave request has been approved by the Advisor, HOD, and Principal.\n\n" +
                            "Leave Details:\n" +
                            "Category: %s\n" +
                            "From Date: %s\n" +
                            "To Date: %s\n" +
                            "Reason: %s\n\n" +
                            "Best regards,\n" +
                            "Academic Administration",
                    student.getName(),
                    leaveRequest.getCategory(),
                    leaveRequest.getFromDate(),
                    leaveRequest.getToDate(),
                    leaveRequest.getReason());

            message.setText(emailBody);
            message.setFrom("msyuthika0@gmail.com"); // Set sender email

            System.out.println("Attempting to send email to: " + student.getEmail());
            mailSender.send(message);
            System.out.println("✅ Approval email sent successfully to: " + student.getEmail());

        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + student.getEmail());
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - we don't want email failure to break the approval
            // process
        }
    }
}
