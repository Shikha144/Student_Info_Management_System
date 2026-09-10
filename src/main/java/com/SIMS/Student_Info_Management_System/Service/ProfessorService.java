package com.SIMS.Student_Info_Management_System.Service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.SIMS.Student_Info_Management_System.DTO.ProfessorCourseDTO;
import com.SIMS.Student_Info_Management_System.DTO.ProfessorDashboardDTO;
import com.SIMS.Student_Info_Management_System.DTO.ProfessorEnrollmentDTO;
import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Entity.enrollments;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.ProfessorsRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorsRepo professorRepo;

    @Autowired
    private EnrollmentsRepo enrollmentRepo;

@Autowired
private PasswordEncoder passwordEncoder;
    // =====================================================
    // ADMIN - GET ALL PROFESSORS
    // =====================================================

    public List<Professors> getAllProfessors() {

        return professorRepo.findAll();
    }


    // =====================================================
    // ADMIN - CREATE PROFESSOR
    // =====================================================

    public Professors saveProfessors(Professors professor) {

    // Always create professors with PROFESSOR role
    if (professor.getRole() == null ||
        professor.getRole().isBlank()) {

        professor.setRole("PROFESSOR");
    }

    // Encode password before saving
    if (professor.getPassword() != null &&
        !professor.getPassword().isBlank()) {

        professor.setPassword(
            passwordEncoder.encode(
                professor.getPassword()
            )
        );
    }

    return professorRepo.save(professor);
}

    // =====================================================
    // FIND PROFESSOR BY EMAIL
    // =====================================================

    public Professors getProfessorByEmail(
            String email) {

        Professors professor =
                professorRepo.findByEmail(email);

        if (professor == null) {

            throw new ResourceNotFoundException(
                    "Professor not found with email: "
                            + email
            );
        }

        return professor;
    }


    // =====================================================
    // PROFESSOR DASHBOARD
    // =====================================================

    @Transactional(readOnly = true)
    public ProfessorDashboardDTO getProfessorDashboard(
            String email) {

        Professors professor =
                getProfessorByEmail(email);

        ProfessorDashboardDTO dashboard =
                new ProfessorDashboardDTO();


        dashboard.setProfessor_id(
                professor.getProfessor_id()
        );

        dashboard.setProfessor_name(
                professor.getProfessor_name()
        );

        dashboard.setEmail(
                professor.getEmail()
        );

        dashboard.setRole(
                professor.getRole()
        );


        List<Course> courses =
                professor.getCourses();

        if (courses == null) {
            courses = Collections.emptyList();
        }


        List<ProfessorCourseDTO> courseDTOs =
                courses.stream()
                        .map(this::mapCourse)
                        .toList();


        dashboard.setCourses(
                courseDTOs
        );


        return dashboard;
    }


    // =====================================================
    // MAP COURSE TO DTO
    // =====================================================

    private ProfessorCourseDTO mapCourse(
            Course course) {

        ProfessorCourseDTO dto =
                new ProfessorCourseDTO();


        dto.setCourse_id(
                course.getCourse_id()
        );

        dto.setCourse_name(
                course.getCourse_name()
        );

        dto.setCredits(
                course.getCredits()
        );


        List<enrollments> enrollments =
                course.getEnrollments();

        if (enrollments == null) {
            enrollments =
                    Collections.emptyList();
        }


        List<ProfessorEnrollmentDTO>
                enrollmentDTOs =
                enrollments.stream()
                        .map(this::mapEnrollment)
                        .toList();


        dto.setEnrollments(
                enrollmentDTOs
        );


        return dto;
    }


    // =====================================================
    // MAP ENROLLMENT TO DTO
    // =====================================================

    private ProfessorEnrollmentDTO mapEnrollment(
            enrollments enrollment) {

        ProfessorEnrollmentDTO dto =
                new ProfessorEnrollmentDTO();


        dto.setEnrollment_id(
                enrollment.getEnrollment_id()
        );

        dto.setGrade(
                enrollment.getGrade()
        );

        dto.setStatus(
                enrollment.getStatus()
        );

        dto.setEnrollment_date(
                enrollment.getEnrollment_date()
        );


        Students student =
                enrollment.getStudent();


        if (student != null) {

            dto.setStudent_id(
                    student.getStudent_id()
            );

            dto.setStudent_first_name(
                    student.getFirstName()
            );

            dto.setStudent_last_name(
                    student.getLastName()
            );

            dto.setStudent_email(
                    student.getEmail()
            );
        }


        return dto;
    }


    // =====================================================
    // PROFESSOR - UPDATE GRADE
    // =====================================================

    @Transactional
    public ProfessorEnrollmentDTO updateGrade(
            String professorEmail,
            Integer enrollmentId,
            String grade) {


        Professors professor =
                getProfessorByEmail(
                        professorEmail
                );


        enrollments enrollment =
                enrollmentRepo.findById(
                        enrollmentId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enrollment not found with id: "
                                        + enrollmentId
                        )
                );


        // =================================================
        // OWNERSHIP CHECK
        // =================================================

        Course course =
                enrollment.getCourse();


        if (course == null ||
                course.getProfessor() == null ||
                course.getProfessor()
                        .getProfessor_id()
                        != professor.getProfessor_id()) {

            throw new AccessDeniedException(
                    "You are not authorized to update "
                    + "this enrollment."
            );
        }


        // =================================================
        // VALIDATE GRADE
        // =================================================

        String normalizedGrade =
                grade.trim().toUpperCase();


        List<String> validGrades =
                List.of(
                        "A+",
                        "A",
                        "A-",
                        "B+",
                        "B",
                        "B-",
                        "C+",
                        "C",
                        "C-",
                        "D+",
                        "D",
                        "F"
                );


        if (!validGrades.contains(
                normalizedGrade)) {

            throw new IllegalArgumentException(
                    "Invalid grade: "
                            + grade
            );
        }


        enrollment.setGrade(
                normalizedGrade
        );


        enrollments saved =
                enrollmentRepo.save(
                        enrollment
                );


        return mapEnrollment(
                saved
        );
    }
    public void deleteProfessor(Integer id) {
    professorRepo.deleteById(id);
}
}