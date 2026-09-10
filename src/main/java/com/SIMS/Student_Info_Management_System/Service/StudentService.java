package com.SIMS.Student_Info_Management_System.Service;
/* 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class StudentService implements UserDetailsService {

    @Autowired
    private StudentRepo studentRepo;

    // =====================================================
    // FIND USER BY EMAIL - USED BY SPRING SECURITY
    // =====================================================

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Students student = studentRepo.findByEmail(email);

        if (student == null) {
            System.out.println("user not found: " + email);
            throw new UsernameNotFoundException("user not found");
        }

        return User.builder()
                .username(student.getEmail())
                .password(student.getPassword())
                .roles(student.getRole())
                .build();
    }


    // =====================================================
    // PAGINATION
    // =====================================================

    public Page<Students> getStudents(
            int page,
            int size,
            String sort) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sort).ascending()
                );

        return studentRepo.findAll(pageable);
    }


    // =====================================================
    // GET ALL STUDENTS
    // =====================================================

    public List<Students> getAllStudents() {

        return studentRepo.findAll();
    }


    // =====================================================
    // CREATE NEW STUDENT
    // =====================================================

    private BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder(12);

    public Students saveStudents(Students student) {

        student.setPassword(
                encoder.encode(student.getPassword())
        );

        return studentRepo.save(student);
    }


    // =====================================================
    // FIND STUDENT BY ID
    // =====================================================

    public Students getStudentById(int id) {

        return studentRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id
                        )
                );
    }


    // =====================================================
    // FIND STUDENT BY EMAIL
    // USED BY /student/me
    // =====================================================

    public Students getStudentByEmail(String email) {

        Students student =
                studentRepo.findByEmail(email);

        if (student == null) {

            throw new ResourceNotFoundException(
                    "Student not found with email: " + email
            );
        }

        return student;
    }


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    public void deleteStudentById(int id) {

        Students student =
                studentRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student not found with id " + id
                                )
                        );

        studentRepo.delete(student);
    }


    public Students saveStudentsWithoutEncoding(Students student) {
    return studentRepo.save(student);
}
}*/

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class StudentService implements UserDetailsService {

    @Autowired
    private StudentRepo studentRepo;


    // =====================================================
    // SPRING SECURITY
    // =====================================================

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Students student =
                studentRepo.findByEmail(email);

        if (student == null) {

            throw new UsernameNotFoundException(
                    "Student not found with email: " + email
            );
        }

        String role = student.getRole();

        if (role == null || role.isBlank()) {

            throw new UsernameNotFoundException(
                    "Student role not found"
            );
        }

        role = role.trim().toUpperCase();

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return User.builder()
                .username(student.getEmail())
                .password(student.getPassword())
                .authorities(role)
                .build();
    }


    // =====================================================
    // PAGINATION
    // =====================================================

    public Page<Students> getStudents(
            int page,
            int size,
            String sort) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sort).ascending()
                );

        return studentRepo.findAll(pageable);
    }


    // =====================================================
    // GET ALL STUDENTS
    // =====================================================

    public List<Students> getAllStudents() {

        return studentRepo.findAll();
    }


    // =====================================================
    // CREATE STUDENT
    // =====================================================

    private final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder(12);


    public Students saveStudents(Students student) {

        if (student.getRole() == null ||
                student.getRole().isBlank()) {

            student.setRole("STUDENT");
        }

        student.setRole(
                normalizeRoleForDatabase(
                        student.getRole()
                )
        );

        if (student.getPassword() != null &&
                !student.getPassword().isBlank()) {

            student.setPassword(
                    encoder.encode(
                            student.getPassword()
                    )
            );
        }

        return studentRepo.save(student);
    }


    // =====================================================
    // SAVE WITHOUT RE-ENCODING PASSWORD
    // =====================================================

    public Students saveStudentsWithoutEncoding(
            Students student) {

        return studentRepo.save(student);
    }


    // =====================================================
    // GET STUDENT BY ID
    // =====================================================

    public Students getStudentById(int id) {

        return studentRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id
                        )
                );
    }


    // =====================================================
    // GET STUDENT BY EMAIL
    // =====================================================

    public Students getStudentByEmail(String email) {

        Students student =
                studentRepo.findByEmail(email);

        if (student == null) {

            throw new ResourceNotFoundException(
                    "Student not found with email: "
                    + email
            );
        }

        return student;
    }


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    public void deleteStudentById(int id) {

        Students student =
                studentRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student not found with id "
                                        + id
                                )
                        );

        studentRepo.delete(student);
    }


    // =====================================================
    // ROLE NORMALIZATION
    // =====================================================

    private String normalizeRoleForDatabase(String role) {

        role = role.trim().toUpperCase();

        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        return role;
    }
}
