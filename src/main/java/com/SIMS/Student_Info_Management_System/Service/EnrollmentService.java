package com.SIMS.Student_Info_Management_System.Service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.DTO.AdminEnrollmentDTO;
import com.SIMS.Student_Info_Management_System.DTO.EnrollmentRequest;
import com.SIMS.Student_Info_Management_System.DTO.EnrollmentResponseDTO;
import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Entity.enrollments;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentsRepo enrollmentRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private CoursesRepo coursesRepo;


    // =====================================================
    // GET ALL ENROLLMENTS
    // =====================================================

    public List<enrollments> getAllEnrollments() {

        return enrollmentRepo.findAll();
    }


    // =====================================================
    // STUDENT - GET MY ENROLLMENTS
    // =====================================================

    public List<EnrollmentResponseDTO> getEnrollmentsByStudentIdDTO(
            Integer studentId) {

        List<enrollments> enrollmentList =
                enrollmentRepo.findEnrollmentsByStudentId(studentId);

        return enrollmentList.stream()
                .map(enrollment -> {

                    EnrollmentResponseDTO dto =
                            new EnrollmentResponseDTO();

                    // -----------------------------
                    // Enrollment information
                    // -----------------------------

                    dto.setEnrollment_id(
                            enrollment.getEnrollment_id()
                    );

                    dto.setEnrollment_date(
                            enrollment.getEnrollment_date()
                    );

                    dto.setStatus(
                            enrollment.getStatus()
                    );

                    dto.setGrade(
                            enrollment.getGrade()
                    );


                    // -----------------------------
                    // Course information
                    // -----------------------------

                    if (enrollment.getCourse() != null) {

                        dto.setCourse_id(
                                enrollment.getCourse().getCourse_id()
                        );

                        dto.setCourse_name(
                                enrollment.getCourse().getCourse_name()
                        );

                        dto.setCredits(
                                enrollment.getCourse().getCredits()
                        );
                    }

                    return dto;

                })
                .toList();
    }


    // =====================================================
    // STUDENT - SAVE DIRECT ENROLLMENT
    // =====================================================

    public enrollments saveDirectEnrollment(
            enrollments enrollment) {

        return enrollmentRepo.save(enrollment);
    }


    // =====================================================
    // ADMIN - CREATE ENROLLMENT
    // =====================================================

    /*public enrollments saveEnrollments(
            EnrollmentRequest request) {

        // Find student
        Students student =
                studentRepo.findById(
                        request.getStudent_id()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: "
                                + request.getStudent_id()
                        )
                );


        // Find course
        Course course =
                coursesRepo.findById(
                        request.getCourse_id()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Course not found with id: "
                                + request.getCourse_id()
                        )
                );


        // Create enrollment
        enrollments enroll =
                new enrollments();

        enroll.setStudent(student);

        enroll.setCourse(course);

        enroll.setGrade(
                request.getGrade()
        );

        enroll.setEnrollment_date(
                LocalDate.now()
        );

        enroll.setStatus(
                "ACTIVE"
        );


        return enrollmentRepo.save(enroll);
    }
*/
public enrollments saveEnrollments(
        EnrollmentRequest request) {

    // =====================================================
    // VALIDATE STUDENT
    // =====================================================

    Students student =
            studentRepo.findById(
                    request.getStudent_id()
            )
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Student not found with id: "
                            + request.getStudent_id()
                    )
            );


    // =====================================================
    // VALIDATE COURSE
    // =====================================================

    Course course =
            coursesRepo.findById(
                    request.getCourse_id()
            )
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Course not found with id: "
                            + request.getCourse_id()
                    )
            );


    // =====================================================
    // PREVENT DUPLICATE ENROLLMENT
    // =====================================================

    boolean alreadyExists =
            enrollmentRepo.existsEnrollment(
                    request.getStudent_id(),
                    request.getCourse_id()
            );

    if (alreadyExists) {

        throw new IllegalArgumentException(
                "Student is already enrolled in this course."
        );
    }


    // =====================================================
    // CREATE ENROLLMENT
    // =====================================================

    enrollments enrollment =
            new enrollments();

    enrollment.setStudent(student);

    enrollment.setCourse(course);

    enrollment.setGrade(
            request.getGrade()
    );

    enrollment.setEnrollment_date(
            LocalDate.now()
    );

    enrollment.setStatus(
            "ACTIVE"
    );


    return enrollmentRepo.save(enrollment);
}

    // =====================================================
    // GET ENROLLMENT BY ID
    // =====================================================

    public enrollments getEnrollmentsById(
            Integer enrollment_id) {

        return enrollmentRepo.findById(enrollment_id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enrollment not found with id: "
                                + enrollment_id
                        )
                );
    }


    // =====================================================
    // UPDATE ENROLLMENT
    // =====================================================

    public enrollments updateEnrollment(
            Integer enrollment_id,
            EnrollmentRequest request) {

        // Find existing enrollment
        enrollments enroll =
                enrollmentRepo.findById(
                        enrollment_id
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enrollment not found with id: "
                                + enrollment_id
                        )
                );


        // Find student
        Students student =
                studentRepo.findById(
                        request.getStudent_id()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: "
                                + request.getStudent_id()
                        )
                );


        // Find course
        Course course =
                coursesRepo.findById(
                        request.getCourse_id()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Course not found with id: "
                                + request.getCourse_id()
                        )
                );


        // Update enrollment
        enroll.setStudent(student);

        enroll.setCourse(course);

        enroll.setGrade(
                request.getGrade()
        );


        return enrollmentRepo.save(enroll);
    }


    // =====================================================
    // DELETE ENROLLMENT
    // =====================================================

    public enrollments deleteEnrollment(
            Integer enrollment_id) {

        enrollments enroll =
                enrollmentRepo.findById(
                        enrollment_id
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enrollment not found with id: "
                                + enrollment_id
                        )
                );


        enrollmentRepo.delete(enroll);

        return enroll;
    }


    // =====================================================
    // ADMIN - GET ALL ENROLLMENTS AS DTO
    // =====================================================

    public List<AdminEnrollmentDTO> getAdminEnrollments() {

        return enrollmentRepo.findAll()
                .stream()
                .map(enrollment -> {

                    AdminEnrollmentDTO dto =
                            new AdminEnrollmentDTO();


                    // -----------------------------
                    // Enrollment ID
                    // -----------------------------

                    dto.setEnrollment_id(
                            enrollment.getEnrollment_id()
                    );


                    // -----------------------------
                    // Student information
                    // -----------------------------

                    if (enrollment.getStudent() != null) {

                        dto.setStudent_id(
                                enrollment.getStudent().getStudent_id()
                        );


                        String firstName =
                                enrollment.getStudent().getFirstName();

                        String lastName =
                                enrollment.getStudent().getLastName();


                        String fullName =
                                (
                                    (firstName != null
                                        ? firstName
                                        : "")
                                    + " "
                                    +
                                    (lastName != null
                                        ? lastName
                                        : "")
                                ).trim();


                        dto.setStudent_name(
                                fullName.isEmpty()
                                        ? enrollment.getStudent().getEmail()
                                        : fullName
                        );


                        dto.setStudent_email(
                                enrollment.getStudent().getEmail()
                        );
                    }


                    // -----------------------------
                    // Course information
                    // -----------------------------

                    if (enrollment.getCourse() != null) {

                        dto.setCourse_id(
                                enrollment.getCourse().getCourse_id()
                        );


                        dto.setCourse_name(
                                enrollment.getCourse().getCourse_name()
                        );


                        dto.setCredits(
                                enrollment.getCourse().getCredits()
                        );
                    }


                    // -----------------------------
                    // Enrollment information
                    // -----------------------------

                    dto.setGrade(
                            enrollment.getGrade()
                    );


                    dto.setEnrollment_date(
                            enrollment.getEnrollment_date()
                    );


                    dto.setStatus(
                            enrollment.getStatus()
                    );


                    return dto;

                })
                .toList();
    }
}

