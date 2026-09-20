package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.SIMS.Student_Info_Management_System.DTO.EnrollmentRequest;
import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Entity.enrollments;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentsRepo enrollmentRepo;

    @Mock
    private StudentRepo studentRepo;

    @Mock
    private CoursesRepo coursesRepo;

    @InjectMocks
    private EnrollmentService enrollmentService;


    private Students student;
    private Course course;
    private enrollments enrollment;


    @BeforeEach
    void setUp() {

        student = new Students();

        student.setStudent_id(1);
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail("john@example.com");


        course = new Course();

        course.setCourse_id(10);
        course.setCourse_name("Java Programming");
        course.setCredits(3);


        enrollment = new enrollments();

        enrollment.setEnrollment_id(100);
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setGrade("A");
        enrollment.setStatus("ACTIVE");
        enrollment.setEnrollment_date(
                LocalDate.of(2026, 9, 1)
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Test
    void getAllEnrollments_shouldReturnEnrollments() {

        when(enrollmentRepo.findAll())
                .thenReturn(List.of(enrollment));

        List<enrollments> result =
                enrollmentService.getAllEnrollments();

        assertEquals(1, result.size());

        assertEquals(
                100,
                result.get(0).getEnrollment_id()
        );

        verify(enrollmentRepo)
                .findAll();
    }


    // =====================================================
    // SAVE DIRECT ENROLLMENT
    // =====================================================

    @Test
    void saveDirectEnrollment_shouldSaveEnrollment() {

        when(enrollmentRepo.save(enrollment))
                .thenReturn(enrollment);

        enrollments result =
                enrollmentService.saveDirectEnrollment(
                        enrollment
                );

        assertSame(
                enrollment,
                result
        );

        verify(enrollmentRepo)
                .save(enrollment);
    }


    // =====================================================
    // CREATE ENROLLMENT - SUCCESS
    // =====================================================

    @Test
    void saveEnrollments_shouldCreateActiveEnrollment() {

        EnrollmentRequest request =
                new EnrollmentRequest();

        request.setStudent_id(1);
        request.setCourse_id(10);
        request.setGrade("A");


        when(studentRepo.findById(1))
                .thenReturn(Optional.of(student));

        when(coursesRepo.findById(10))
                .thenReturn(Optional.of(course));

        when(enrollmentRepo.existsEnrollment(1, 10))
                .thenReturn(false);

        when(enrollmentRepo.save(any(enrollments.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );


        enrollments result =
                enrollmentService.saveEnrollments(
                        request
                );


        assertNotNull(result);

        assertSame(
                student,
                result.getStudent()
        );

        assertSame(
                course,
                result.getCourse()
        );

        assertEquals(
                "A",
                result.getGrade()
        );

        assertEquals(
                "ACTIVE",
                result.getStatus()
        );

        assertEquals(
                LocalDate.now(),
                result.getEnrollment_date()
        );


        verify(studentRepo)
                .findById(1);

        verify(coursesRepo)
                .findById(10);

        verify(enrollmentRepo)
                .existsEnrollment(1, 10);

        verify(enrollmentRepo)
                .save(any(enrollments.class));
    }


    // =====================================================
    // STUDENT NOT FOUND
    // =====================================================

    @Test
    void saveEnrollments_shouldThrowWhenStudentDoesNotExist() {

        EnrollmentRequest request =
                new EnrollmentRequest();

        request.setStudent_id(999);
        request.setCourse_id(10);
        request.setGrade("A");


        when(studentRepo.findById(999))
                .thenReturn(Optional.empty());


        assertThrows(
                ResourceNotFoundException.class,
                () -> enrollmentService.saveEnrollments(
                        request
                )
        );


        verify(coursesRepo, never())
                .findById(anyInt());

        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }


    // =====================================================
    // COURSE NOT FOUND
    // =====================================================

    @Test
    void saveEnrollments_shouldThrowWhenCourseDoesNotExist() {

        EnrollmentRequest request =
                new EnrollmentRequest();

        request.setStudent_id(1);
        request.setCourse_id(999);
        request.setGrade("A");


        when(studentRepo.findById(1))
                .thenReturn(Optional.of(student));

        when(coursesRepo.findById(999))
                .thenReturn(Optional.empty());


        assertThrows(
                ResourceNotFoundException.class,
                () -> enrollmentService.saveEnrollments(
                        request
                )
        );


        verify(enrollmentRepo, never())
                .existsEnrollment(anyInt(), anyInt());

        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }


    // =====================================================
    // DUPLICATE ENROLLMENT
    // =====================================================

    @Test
    void saveEnrollments_shouldRejectDuplicateEnrollment() {

        EnrollmentRequest request =
                new EnrollmentRequest();

        request.setStudent_id(1);
        request.setCourse_id(10);
        request.setGrade("A");


        when(studentRepo.findById(1))
                .thenReturn(Optional.of(student));

        when(coursesRepo.findById(10))
                .thenReturn(Optional.of(course));

        when(enrollmentRepo.existsEnrollment(1, 10))
                .thenReturn(true);


        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> enrollmentService.saveEnrollments(
                                request
                        )
                );


        assertEquals(
                "Student is already enrolled in this course.",
                exception.getMessage()
        );


        verify(enrollmentRepo, never())
                .save(any(enrollments.class));
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Test
    void getEnrollmentsById_shouldReturnEnrollment() {

        when(enrollmentRepo.findById(100))
                .thenReturn(Optional.of(enrollment));

        enrollments result =
                enrollmentService.getEnrollmentsById(100);

        assertNotNull(result);

        assertEquals(
                100,
                result.getEnrollment_id()
        );
    }


    // =====================================================
    // GET BY ID - NOT FOUND
    // =====================================================

    @Test
    void getEnrollmentsById_shouldThrowWhenNotFound() {

        when(enrollmentRepo.findById(999))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> enrollmentService.getEnrollmentsById(999)
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    @Test
    void deleteEnrollment_shouldDeleteExistingEnrollment() {

        when(enrollmentRepo.findById(100))
                .thenReturn(Optional.of(enrollment));

        enrollments result =
                enrollmentService.deleteEnrollment(100);

        assertSame(
                enrollment,
                result
        );

        verify(enrollmentRepo)
                .delete(enrollment);
    }


    // =====================================================
    // DELETE - NOT FOUND
    // =====================================================

    @Test
    void deleteEnrollment_shouldThrowWhenNotFound() {

        when(enrollmentRepo.findById(999))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> enrollmentService.deleteEnrollment(999)
        );

        verify(enrollmentRepo, never())
                .delete(any(enrollments.class));

                
    }

}