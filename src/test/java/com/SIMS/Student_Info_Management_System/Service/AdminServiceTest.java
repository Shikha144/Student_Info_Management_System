package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Repo.AdminsRepo;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminsRepo adminRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;


    private Admins admin;


    @BeforeEach
    void setUp() {

        admin = new Admins();

        admin.setEmail("admin@example.com");
        admin.setPassword("adminPassword");
        admin.setRole(null);
    }


    @Test
    void registerAdmin_shouldEncodePasswordAndSetDefaultRole() {

        when(passwordEncoder.encode("adminPassword"))
                .thenReturn("encodedPassword");

        when(adminRepo.save(any(Admins.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        Admins result =
                adminService.registerAdmin(admin);

        assertNotNull(result);

        assertEquals(
                "encodedPassword",
                result.getPassword()
        );

        assertEquals(
                "ROLE_ADMIN",
                result.getRole()
        );

        verify(passwordEncoder)
                .encode("adminPassword");

        verify(adminRepo)
                .save(admin);
    }


    @Test
    void registerAdmin_shouldKeepExistingRole() {

        admin.setRole("ROLE_SUPER_ADMIN");

        when(passwordEncoder.encode("adminPassword"))
                .thenReturn("encodedPassword");

        when(adminRepo.save(admin))
                .thenReturn(admin);

        Admins result =
                adminService.registerAdmin(admin);

        assertEquals(
                "ROLE_SUPER_ADMIN",
                result.getRole()
        );

        verify(adminRepo)
                .save(admin);
    }
}
