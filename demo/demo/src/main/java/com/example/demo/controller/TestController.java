package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api/test")
@CrossOrigin("*")
public class TestController {

    private final JavaMailSender mailSender;

    public TestController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @GetMapping("/email")
    public String testEmail(@RequestParam String to) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("msyuthika0@gmail.com");
            message.setTo(to);
            message.setSubject("Test Email from Leave Management System");
            message.setText(
                    "This is a test email to verify your email configuration is working correctly.\n\nIf you receive this, your email setup is successful!");

            mailSender.send(message);
            return "✅ Test email sent successfully to: " + to;
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Failed to send email: " + e.getMessage();
        }
    }
}
