package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Entity.enrollments;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.ProfessorsRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class ProfessorServiceTest {

    @Mock
    private ProfessorsRepo professorRepo;

    @Mock
    private EnrollmentsRepo enrollmentRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfessorService professorService;


    private Professors professor;
    private Course course;
    private Students student;
    private enrollments enrollment;


    @BeforeEach
    void setUp() {

        professor = new Professors();

        professor.setProfessor_id(1);
        professor.setProfessor_name("Alan Turing");
        professor.setEmail("turing@example.com");
        professor.setPassword("plainPassword");
        professor.setRole("PROFESSOR");


        student = new Students();

        student.setStudent_id(10);
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail("john@example.com");


        course = new Course();

        course.setCourse_id(100);
        course.setCourse_name("Java Programming");
        course.setCredits(3);
        course.setProfessor(professor);


        enrollment = new enrollments();

        enrollment.setEnrollment_id(500);
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setGrade(null);
        enrollment.setStatus("ACTIVE");
    }


    @Test
    void getProfessorByEmail_shouldReturnProfessor() {

        when(professorRepo.findByEmail(
                "turing@example.com"
        )).thenReturn(professor);

        Professors result =
                professorService.getProfessorByEmail(
                        "turing@example.com"
                );

        assertNotNull(result);

        assertEquals(
                "turing@example.com",
                result.getEmail()
        );
    }


    @Test
    void getProfessorByEmail_shouldThrowWhenNotFound() {

        when(professorRepo.findByEmail(
                "missing@example.com"
        )).thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> professorService.getProfessorByEmail(
                        "missing@example.com"
                )
        );
    }


    @Test
    void saveProfessors_shouldSetDefaultRoleAndEncodePassword() {

        professor.setRole(null);

        when(passwordEncoder.encode("plainPassword"))
                .thenReturn("encodedPassword");

        when(professorRepo.save(professor))
                .thenReturn(professor);

        Professors result =
                professorService.saveProfessors(
                        professor
                );

        assertEquals(
                "PROFESSOR",
                result.getRole()
        );

        assertEquals(
                "encodedPassword",
                result.getPassword()
        );

        verify(passwordEncoder)
                .encode("plainPassword");

        verify(professorRepo)
                .save(professor);
    }


    @Test
    void updateGrade_shouldUpdateValidGrade() {

        when(professorRepo.findByEmail(
                "turing@example.com"
        )).thenReturn(professor);

        when(enrollmentRepo.findById(500))
                .thenReturn(Optional.of(enrollment));

        when(enrollmentRepo.save(enrollment))
                .thenReturn(enrollment);


        var result =
                professorService.updateGrade(
                        "turing@example.com",
                        500,
                        "a+"
                );


        assertEquals(
                "A+",
                enrollment.getGrade()
        );

        assertEquals(
                "A+",
                result.getGrade()
        );

        verify(enrollmentRepo)
                .save(enrollment);
    }


    @Test
    void updateGrade_shouldRejectInvalidGrade() {

        when(professorRepo.findByEmail(
                "turing@example.com"
        )).thenReturn(professor);

        when(enrollmentRepo.findById(500))
                .thenReturn(Optional.of(enrollment));


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> professorService.updateGrade(
                                "turing@example.com",
                                500,
                                "Z"
                        )
                );


        assertTrue(
                exception.getMessage()
                        .contains("Invalid grade")
        );

        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }


    @Test
    void updateGrade_shouldRejectUnauthorizedProfessor() {

        Professors otherProfessor =
                new Professors();

        otherProfessor.setProfessor_id(999);
        otherProfessor.setEmail(
                "other@example.com"
        );
        otherProfessor.setRole("PROFESSOR");


        when(professorRepo.findByEmail(
                "other@example.com"
        )).thenReturn(otherProfessor);

        when(enrollmentRepo.findById(500))
                .thenReturn(Optional.of(enrollment));


        assertThrows(
                AccessDeniedException.class,
                () -> professorService.updateGrade(
                        "other@example.com",
                        500,
                        "A"
                )
        );


        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }


    @Test
    void updateGrade_shouldThrowWhenEnrollmentNotFound() {

        when(professorRepo.findByEmail(
                "turing@example.com"
        )).thenReturn(professor);

        when(enrollmentRepo.findById(999))
                .thenReturn(Optional.empty());


        assertThrows(
                ResourceNotFoundException.class,
                () -> professorService.updateGrade(
                        "turing@example.com",
                        999,
                        "A"
                )
        );


        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }
}