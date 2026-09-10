package com.SIMS.Student_Info_Management_System.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Repo.AdminsRepo;

@Service
public class AdminService {

    @Autowired
    private AdminsRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================================================
    // REGISTER ADMIN
    // =====================================================

    public Admins registerAdmin(Admins admin) {

        admin.setPassword(
                passwordEncoder.encode(admin.getPassword())
        );

        // Set default role if no role was provided
        if (admin.getRole() == null ||
            admin.getRole().trim().isEmpty()) {

            admin.setRole("ROLE_ADMIN");
        }

        return adminRepo.save(admin);
    }
}
