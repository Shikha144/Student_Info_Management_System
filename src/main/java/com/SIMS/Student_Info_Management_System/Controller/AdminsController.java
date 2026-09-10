package com.SIMS.Student_Info_Management_System.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SIMS.Student_Info_Management_System.DTO.AdminEnrollmentDTO;
import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Service.AdminService;
import com.SIMS.Student_Info_Management_System.Service.EnrollmentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/admins")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminsController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private EnrollmentService enrollmentService;


    // =====================================================
    // ADMIN DASHBOARD CHECK
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<String> adminDashboard(
            Authentication authentication) {

        return ResponseEntity.ok(
                "Welcome to admin dashboard, "
                + authentication.getName()
        );
    }


    // =====================================================
    // REGISTER ADMIN
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<Admins> createAdmin(
            @RequestBody Admins admin) {

        Admins savedAdmin =
                adminService.registerAdmin(admin);

        return ResponseEntity.ok(savedAdmin);
    }


    // =====================================================
    // ADMIN - VIEW ALL ENROLLMENTS
    // =====================================================

    @GetMapping("/admin/enrollments")
    public ResponseEntity<List<AdminEnrollmentDTO>>
            getAdminEnrollments() {

        return ResponseEntity.ok(
                enrollmentService.getAdminEnrollments()
        );
    }
}
