package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepo, com.example.demo.repository.StudentRepository studentRepo) {
		return args -> {
			// Seed Advisor
			if (userRepo.findByUsername("advisor") == null) {
				User advisor = new User();
				advisor.setUsername("advisor");
				advisor.setPassword("advisor123");
				advisor.setRole("ADVISOR");
				userRepo.save(advisor);
				System.out.println("Seeded User: advisor / advisor123");
			}
			// Seed HOD
			if (userRepo.findByUsername("hod") == null) {
				User hod = new User();
				hod.setUsername("hod");
				hod.setPassword("hod123");
				hod.setRole("HOD");
				userRepo.save(hod);
				System.out.println("Seeded User: hod / hod123");
			}
			// Seed Principal
			if (userRepo.findByUsername("principal") == null) {
				User principal = new User();
				principal.setUsername("principal");
				principal.setPassword("principal123");
				principal.setRole("PRINCIPAL");
				userRepo.save(principal);
				System.out.println("Seeded User: principal / principal123");
			}

		};
	}
}
