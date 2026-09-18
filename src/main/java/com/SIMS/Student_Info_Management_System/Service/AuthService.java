package com.SIMS.Student_Info_Management_System.Service;
/* 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTStudentService service;

    public String Verify(String email, String password) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                password
                        )
                );

        if (authentication.isAuthenticated()) {
            return service.generateToken(authentication);
        }

        return "login failed, new user register first";
    }
}*/
 
/* 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTStudentService jwtService;

    public String verify(
            String email,
            String password,
            String expectedRole) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                password
                        )
                );
                System.out.println("AUTHENTICATED USER: " + authentication.getName());
System.out.println("AUTHORITIES: " + authentication.getAuthorities());
System.out.println("EXPECTED ROLE: " + expectedRole);

        boolean roleMatches =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals(expectedRole)
                        );

        if (!roleMatches) {
            throw new IllegalArgumentException(
                    "You are not authorized to use this login."
            );
        }

        return jwtService.generateToken(authentication);
    }
}
*/

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.AdminsRepo;
import com.SIMS.Student_Info_Management_System.Repo.ProfessorsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;

@Service
public class AuthService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private ProfessorsRepo professorRepo;

    @Autowired
    private AdminsRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTStudentService jwtService;

    /*
     * Existing generic authentication method.
     * Keep this for student/admin authentication.
     */
    public String verify(
            String email,
            String password,
            String expectedRole) {

        UserDetails userDetails;

        // STUDENT
        if ("ROLE_STUDENT".equals(expectedRole)) {

            Students student =
                    studentRepo.findByEmail(email);

            if (student == null) {
                throw new IllegalArgumentException(
                        "Student not found."
                );
            }

            String role =
                    normalizeRole(student.getRole());

            userDetails =
                    User.builder()
                            .username(student.getEmail())
                            .password(student.getPassword())
                            .authorities(role)
                            .build();
        }

        // PROFESSOR
        else if ("ROLE_PROFESSOR".equals(expectedRole)) {

            Professors professor =
                    professorRepo.findByEmail(email);

            if (professor == null) {
                throw new IllegalArgumentException(
                        "Professor not found."
                );
            }

            String role =
                    normalizeRole(professor.getRole());

            userDetails =
                    User.builder()
                            .username(professor.getEmail())
                            .password(professor.getPassword())
                            .authorities(role)
                            .build();
        }

        // ADMIN
        else if ("ROLE_ADMIN".equals(expectedRole)) {

            Admins admin =
                    adminRepo.findByEmail(email);

            if (admin == null) {
                throw new IllegalArgumentException(
                        "Admin not found."
                );
            }

            String role =
                    normalizeRole(admin.getRole());

            userDetails =
                    User.builder()
                            .username(admin.getEmail())
                            .password(admin.getPassword())
                            .authorities(role)
                            .build();
        }

        else {
            throw new IllegalArgumentException(
                    "Invalid login role."
            );
        }

        // Password verification
        if (!passwordEncoder.matches(
                password,
                userDetails.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid credentials."
            );
        }

        // Role verification
        boolean roleMatches =
                userDetails.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals(expectedRole)
                        );

        if (!roleMatches) {
            throw new IllegalArgumentException(
                    "You are not authorized to use this login."
            );
        }

        // Create Authentication for JWT
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        return jwtService.generateToken(authentication);
    }

    /*
     * PROFESSOR-SPECIFIC LOGIN
     *
     * This method intentionally goes directly to the
     * professors table and does not use AuthenticationManager
     * or CustomUserDetailsService.
     */
    public String verifyProfessor(
            String email,
            String password) {

        Professors professor =
                professorRepo.findByEmail(email);

        if (professor == null) {
            throw new IllegalArgumentException(
                    "Professor account not found."
            );
        }

        if (professor.getPassword() == null ||
                professor.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Professor password is not configured."
            );
        }

        // BCrypt password verification
        if (!passwordEncoder.matches(
                password,
                professor.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid professor password."
            );
        }

        // Normalize professor role
        String role =
                normalizeRole(professor.getRole());

        // Professor portal must be ROLE_PROFESSOR
        if (!"ROLE_PROFESSOR".equals(role)) {

            throw new IllegalArgumentException(
                    "This account is not authorized for the professor portal."
            );
        }

        /*
         * Create Authentication only after successful
         * database, password, and role verification.
         */
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        professor.getEmail(),
                        null,
                        Collections.singletonList(
                                new SimpleGrantedAuthority(
                                        "ROLE_PROFESSOR"
                                )
                        )
                );

        return jwtService.generateToken(authentication);
    }

    /*
     * Converts:
     *
     * PROFESSOR -> ROLE_PROFESSOR
     * STUDENT    -> ROLE_STUDENT
     * ADMIN      -> ROLE_ADMIN
     */
    private String normalizeRole(String role) {

        if (role == null || role.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User role cannot be null or empty."
            );
        }

        role = role.trim().toUpperCase();

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return role;
    }
}