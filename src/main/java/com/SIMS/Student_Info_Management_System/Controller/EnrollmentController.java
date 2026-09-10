package com.SIMS.Student_Info_Management_System.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SIMS.Student_Info_Management_System.DTO.EnrollmentRequest;
import com.SIMS.Student_Info_Management_System.DTO.EnrollmentResponseDTO;
import com.SIMS.Student_Info_Management_System.DTO.StudentResponseDTO;
import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Entity.enrollments;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.Service.EnrollmentService;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;
import com.SIMS.Student_Info_Management_System.Service.StudentService;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private CoursesRepo coursesRepo;


    // =========================================================
    // ADMIN - GET ALL ENROLLMENTS
    // =========================================================

    @GetMapping("/getEnrollments")
    public ResponseEntity<List<enrollments>> getAllEnrollments() {

        return ResponseEntity.ok(
            enrollmentService.getAllEnrollments()
        );
    }


    // =========================================================
    // STUDENT - GET MY ENROLLMENTS
    // =========================================================

   @GetMapping("/enrollments/my")
public ResponseEntity<List<EnrollmentResponseDTO>> getMyEnrollments(
        Authentication authentication) {

    String email = authentication.getName();

    Students student =
            studentRepo.findByEmail(email);

    if (student == null) {
        throw new ResourceNotFoundException(
                "Student not found with email: " + email
        );
    }

    List<EnrollmentResponseDTO> enrollments =
            enrollmentService.getEnrollmentsByStudentIdDTO(
                    student.getStudent_id()
            );

    return ResponseEntity.ok(enrollments);
}
    // =========================================================
    // STUDENT - ENROLL IN COURSE
    // =========================================================

    @PostMapping("/enrollments")
    public ResponseEntity<enrollments> enrollInCourse(
            @RequestBody EnrollmentRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Students student = studentRepo.findByEmail(email);

        if (student == null) {
            throw new ResourceNotFoundException(
                "Student not found with email: " + email
            );
        }

        Course course = coursesRepo.findById(
            request.getCourse_id()
        ).orElseThrow(() ->
            new ResourceNotFoundException(
                "Course not found with id: "
                + request.getCourse_id()
            )
        );

        enrollments enrollment = new enrollments();

        // IMPORTANT:
        // Student comes from JWT, NOT from frontend
        enrollment.setStudent(student);

        enrollment.setCourse(course);
        enrollment.setGrade(null);
        enrollment.setEnrollment_date(LocalDate.now());
        enrollment.setStatus("ACTIVE");

        enrollments saved =
            enrollmentService.saveDirectEnrollment(enrollment);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(saved);
    }


    // =========================================================
    // STUDENT - DROP THEIR OWN ENROLLMENT
    // =========================================================

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<String> dropEnrollment(
            @PathVariable Integer enrollmentId,
            Authentication authentication) {

        String email = authentication.getName();

        Students student = studentRepo.findByEmail(email);

        if (student == null) {
            throw new ResourceNotFoundException(
                "Student not found with email: " + email
            );
        }

        enrollments enrollment =
            enrollmentService.getEnrollmentsById(
                enrollmentId
            );

        // SECURITY CHECK
        if (
            enrollment.getStudent() == null ||
            enrollment.getStudent().getStudent_id()
                != student.getStudent_id()
        ) {

            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                    "You are not authorized to drop this enrollment."
                );
        }

        enrollmentService.deleteEnrollment(enrollmentId);

        return ResponseEntity.ok(
            "Enrollment dropped successfully."
        );
    }


    // =========================================================
    // EXISTING ADMIN - CREATE ENROLLMENT
    // =========================================================

    @PostMapping("/createEnrollments")
    public ResponseEntity<enrollments> createEnrollments(
            @Valid @RequestBody EnrollmentRequest request) {

        enrollments enrollment =
            enrollmentService.saveEnrollments(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(enrollment);
    }


    // =========================================================
    // EXISTING ADMIN - GET BY ID
    // =========================================================

    @GetMapping("/get/{enrollment_id}")
    public ResponseEntity<enrollments> getEnrollmentsById(
            @PathVariable Integer enrollment_id) {

        return ResponseEntity.ok(
            enrollmentService.getEnrollmentsById(
                enrollment_id
            )
        );
    }


    // =========================================================
    // EXISTING ADMIN - UPDATE
    // =========================================================

    @PutMapping("/update/{enrollment_id}")
    public ResponseEntity<enrollments> updateEnrollment(
            @PathVariable Integer enrollment_id,
            @Valid @RequestBody EnrollmentRequest request) {

        return ResponseEntity.ok(
            enrollmentService.updateEnrollment(
                enrollment_id,
                request
            )
        );
    }


    // =========================================================
    // EXISTING ADMIN - DELETE
    // =========================================================

    @DeleteMapping("/delete/{enrollment_id}")
    public ResponseEntity<String> deleteEnrollment(
            @PathVariable Integer enrollment_id) {

        enrollmentService.deleteEnrollment(
            enrollment_id
        );

        return ResponseEntity.ok(
            "Enrollment Id "
            + enrollment_id
            + " deleted successfully"
        );
    }

    @GetMapping("/me")
public StudentResponseDTO getMyProfile(Authentication authentication) {

    String email = authentication.getName();

    Students student = studentService.getStudentByEmail(email);

    StudentResponseDTO dto = new StudentResponseDTO();

    dto.setStudent_id(student.getStudent_id());
    dto.setFirstName(student.getFirstName());
    dto.setLastName(student.getLastName());
    dto.setEmail(student.getEmail());
    dto.setRole(student.getRole());

    return dto;
}
}