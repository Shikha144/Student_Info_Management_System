package com.SIMS.Student_Info_Management_System.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.AdminsRepo;
import com.SIMS.Student_Info_Management_System.Repo.ProfessorsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private ProfessorsRepo professorRepo;

    @Autowired
    private AdminsRepo adminRepo;


    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // =====================================================
        // STUDENT
        // =====================================================

        Students student =
                studentRepo.findByEmail(email);

        if (student != null) {

            String role =
                    normalizeRole(student.getRole());

            return User.builder()
                    .username(student.getEmail())
                    .password(student.getPassword())
                    .authorities(role)
                    .build();
        }


        // =====================================================
        // PROFESSOR
        // =====================================================

        Professors professor =
                professorRepo.findByEmail(email);

        if (professor != null) {

            String role =
                    normalizeRole(professor.getRole());

            return User.builder()
                    .username(professor.getEmail())
                    .password(professor.getPassword())
                    .authorities(role)
                    .build();
        }


        // =====================================================
        // ADMIN
        // =====================================================

        Admins admin =
                adminRepo.findByEmail(email);

        if (admin != null) {

            String role =
                    normalizeRole(admin.getRole());

            return User.builder()
                    .username(admin.getEmail())
                    .password(admin.getPassword())
                    .authorities(role)
                    .build();
        }


        throw new UsernameNotFoundException(
                "User not found with email: " + email
        );
    }


    // =====================================================
    // NORMALIZE ROLE
    // =====================================================

    private String normalizeRole(String role) {

        if (role == null || role.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User role cannot be null or empty"
            );
        }

        role = role.trim().toUpperCase();

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return role;
    }
}
