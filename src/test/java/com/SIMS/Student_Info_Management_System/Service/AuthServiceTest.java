package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Entity.Students;

import com.SIMS.Student_Info_Management_System.Repo.AdminsRepo;
import com.SIMS.Student_Info_Management_System.Repo.ProfessorsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;


@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private StudentRepo studentRepo;

    @Mock
    private ProfessorsRepo professorRepo;

    @Mock
    private AdminsRepo adminRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTStudentService jwtService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;


    // ---------------------------------------------------------
    // Common test data
    // ---------------------------------------------------------

    private Students student;
    private Professors professor;
    private Admins admin;


    @BeforeEach
    void setUp() {

        student = new Students();
        student.setStudent_id(1);
        student.setEmail("student@test.com");
        student.setPassword("$2a$12$student-hashed-password");
        student.setRole("STUDENT");


        professor = new Professors();
        professor.setProfessor_id(1);
        professor.setProfessor_name("Test Professor");
        professor.setEmail("professor@test.com");
        professor.setPassword("$2a$12$professor-hashed-password");
        professor.setRole("PROFESSOR");


        admin = new Admins();
        admin.setAdmin_id(1);
        admin.setUsername("testadmin");
        admin.setEmail("admin@test.com");
        admin.setPassword("$2a$12$admin-hashed-password");
        admin.setRole("ADMIN");
    }


    // =========================================================
    // verify() - STUDENT
    // =========================================================

    @Test
    void verifyStudentLoginSuccessfully() {

        when(studentRepo.findByEmail("student@test.com"))
                .thenReturn(student);

        when(passwordEncoder.matches(
                "password123",
                student.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("student-jwt-token");


        String result = authService.verify(
                "student@test.com",
                "password123",
                "ROLE_STUDENT"
        );


        assertEquals("student-jwt-token", result);

        verify(studentRepo)
                .findByEmail("student@test.com");

        verify(passwordEncoder)
                .matches("password123", student.getPassword());

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verify() - PROFESSOR
    // =========================================================

    @Test
    void verifyProfessorThroughGenericVerifySuccessfully() {

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("professor-jwt-token");


        String result = authService.verify(
                "professor@test.com",
                "password123",
                "ROLE_PROFESSOR"
        );


        assertEquals("professor-jwt-token", result);

        verify(professorRepo)
                .findByEmail("professor@test.com");

        verify(passwordEncoder)
                .matches("password123", professor.getPassword());

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verify() - ADMIN
    // =========================================================

    @Test
    void verifyAdminLoginSuccessfully() {

        when(adminRepo.findByEmail("admin@test.com"))
                .thenReturn(admin);

        when(passwordEncoder.matches(
                "password123",
                admin.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("admin-jwt-token");


        String result = authService.verify(
                "admin@test.com",
                "password123",
                "ROLE_ADMIN"
        );


        assertEquals("admin-jwt-token", result);

        verify(adminRepo)
                .findByEmail("admin@test.com");

        verify(passwordEncoder)
                .matches("password123", admin.getPassword());

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verify() - Student not found
    // =========================================================

    @Test
    void verifyStudentThrowsExceptionWhenStudentNotFound() {

        when(studentRepo.findByEmail("missing@test.com"))
                .thenReturn(null);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "missing@test.com",
                                "password123",
                                "ROLE_STUDENT"
                        )
                );


        assertEquals(
                "Student not found.",
                exception.getMessage()
        );

        verify(studentRepo)
                .findByEmail("missing@test.com");

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verify() - Professor not found
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionWhenProfessorNotFound() {

        when(professorRepo.findByEmail("missing@test.com"))
                .thenReturn(null);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "missing@test.com",
                                "password123",
                                "ROLE_PROFESSOR"
                        )
                );


        assertEquals(
                "Professor not found.",
                exception.getMessage()
        );

        verify(professorRepo)
                .findByEmail("missing@test.com");

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verify() - Admin not found
    // =========================================================

    @Test
    void verifyAdminThrowsExceptionWhenAdminNotFound() {

        when(adminRepo.findByEmail("missing@test.com"))
                .thenReturn(null);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "missing@test.com",
                                "password123",
                                "ROLE_ADMIN"
                        )
                );


        assertEquals(
                "Admin not found.",
                exception.getMessage()
        );

        verify(adminRepo)
                .findByEmail("missing@test.com");

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verify() - Invalid password
    // =========================================================

    @Test
    void verifyThrowsExceptionForInvalidStudentPassword() {

        when(studentRepo.findByEmail("student@test.com"))
                .thenReturn(student);

        when(passwordEncoder.matches(
                "wrong-password",
                student.getPassword()))
                .thenReturn(false);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "student@test.com",
                                "wrong-password",
                                "ROLE_STUDENT"
                        )
                );


        assertEquals(
                "Invalid credentials.",
                exception.getMessage()
        );

        verify(passwordEncoder)
                .matches("wrong-password", student.getPassword());

        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verify() - Role mismatch
    // =========================================================

    @Test
void verifyThrowsExceptionWhenStudentUsesAdminLogin() {

    when(adminRepo.findByEmail("student@test.com"))
            .thenReturn(null);

    IllegalArgumentException exception =
            assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.verify(
                            "student@test.com",
                            "password123",
                            "ROLE_ADMIN"
                    )
            );

    assertEquals(
            "Admin not found.",
            exception.getMessage()
    );

    verify(adminRepo)
            .findByEmail("student@test.com");

    verifyNoInteractions(passwordEncoder);
    verifyNoInteractions(jwtService);
}

    // =========================================================
    // verify() - Invalid expected role
    // =========================================================

    @Test
    void verifyThrowsExceptionForInvalidLoginRole() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "user@test.com",
                                "password123",
                                "ROLE_UNKNOWN"
                        )
                );


        assertEquals(
                "Invalid login role.",
                exception.getMessage()
        );

        verifyNoInteractions(
                studentRepo,
                professorRepo,
                adminRepo,
                passwordEncoder,
                jwtService
        );
    }


    // =========================================================
    // verify() - Role normalization
    // =========================================================

    @Test
    void verifyAcceptsRoleWithoutRolePrefix() {

        student.setRole("student");

        when(studentRepo.findByEmail("student@test.com"))
                .thenReturn(student);

        when(passwordEncoder.matches(
                "password123",
                student.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("student-token");


        String result = authService.verify(
                "student@test.com",
                "password123",
                "ROLE_STUDENT"
        );


        assertEquals("student-token", result);

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verify() - Role with lowercase
    // =========================================================

    @Test
    void verifyNormalizesLowercaseProfessorRole() {

        professor.setRole("professor");

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("professor-token");


        String result = authService.verify(
                "professor@test.com",
                "password123",
                "ROLE_PROFESSOR"
        );


        assertEquals("professor-token", result);

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verify() - Null role
    // =========================================================

    @Test
    void verifyThrowsExceptionWhenStudentRoleIsNull() {

        student.setRole(null);

        when(studentRepo.findByEmail("student@test.com"))
                .thenReturn(student);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "student@test.com",
                                "password123",
                                "ROLE_STUDENT"
                        )
                );


        assertEquals(
                "User role cannot be null or empty.",
                exception.getMessage()
        );

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verify() - Blank role
    // =========================================================

    @Test
    void verifyThrowsExceptionWhenStudentRoleIsBlank() {

        student.setRole("   ");

        when(studentRepo.findByEmail("student@test.com"))
                .thenReturn(student);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verify(
                                "student@test.com",
                                "password123",
                                "ROLE_STUDENT"
                        )
                );


        assertEquals(
                "User role cannot be null or empty.",
                exception.getMessage()
        );

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Successful login
    // =========================================================

    @Test
    void verifyProfessorSuccessfully() {

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("professor-jwt-token");


        String result = authService.verifyProfessor(
                "professor@test.com",
                "password123"
        );


        assertEquals(
                "professor-jwt-token",
                result
        );

        verify(professorRepo)
                .findByEmail("professor@test.com");

        verify(passwordEncoder)
                .matches("password123", professor.getPassword());

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }


    // =========================================================
    // verifyProfessor() - Professor not found
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionWhenAccountNotFound() {

        when(professorRepo.findByEmail("missing@test.com"))
                .thenReturn(null);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "missing@test.com",
                                "password123"
                        )
                );


        assertEquals(
                "Professor account not found.",
                exception.getMessage()
        );

        verify(professorRepo)
                .findByEmail("missing@test.com");

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Null password
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionWhenPasswordIsNull() {

        professor.setPassword(null);

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "professor@test.com",
                                "password123"
                        )
                );


        assertEquals(
                "Professor password is not configured.",
                exception.getMessage()
        );

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Blank password
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionWhenPasswordIsBlank() {

        professor.setPassword("   ");

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "professor@test.com",
                                "password123"
                        )
                );


        assertEquals(
                "Professor password is not configured.",
                exception.getMessage()
        );

        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Invalid password
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionForInvalidPassword() {

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "wrong-password",
                professor.getPassword()))
                .thenReturn(false);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "professor@test.com",
                                "wrong-password"
                        )
                );


        assertEquals(
                "Invalid professor password.",
                exception.getMessage()
        );

        verify(passwordEncoder)
                .matches(
                        "wrong-password",
                        professor.getPassword()
                );

        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Wrong role
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionForNonProfessorRole() {

        professor.setRole("STUDENT");

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "professor@test.com",
                                "password123"
                        )
                );


        assertEquals(
                "This account is not authorized for the professor portal.",
                exception.getMessage()
        );

        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Null role
    // =========================================================

    @Test
    void verifyProfessorThrowsExceptionWhenRoleIsNull() {

        professor.setRole(null);

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.verifyProfessor(
                                "professor@test.com",
                                "password123"
                        )
                );


        assertEquals(
                "User role cannot be null or empty.",
                exception.getMessage()
        );

        verifyNoInteractions(jwtService);
    }


    // =========================================================
    // verifyProfessor() - Lowercase role normalization
    // =========================================================

    @Test
    void verifyProfessorAcceptsLowercaseProfessorRole() {

        professor.setRole("professor");

        when(professorRepo.findByEmail("professor@test.com"))
                .thenReturn(professor);

        when(passwordEncoder.matches(
                "password123",
                professor.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(any(Authentication.class)))
                .thenReturn("professor-token");


        String result = authService.verifyProfessor(
                "professor@test.com",
                "password123"
        );


        assertEquals(
                "professor-token",
                result
        );

        verify(jwtService)
                .generateToken(any(Authentication.class));
    }
}