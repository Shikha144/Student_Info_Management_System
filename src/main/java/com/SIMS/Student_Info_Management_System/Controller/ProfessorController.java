package com.SIMS.Student_Info_Management_System.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.SIMS.Student_Info_Management_System.DTO.GradeRequest;
import com.SIMS.Student_Info_Management_System.DTO.ProfessorDashboardDTO;
import com.SIMS.Student_Info_Management_System.DTO.ProfessorEnrollmentDTO;
import com.SIMS.Student_Info_Management_System.Entity.Professors;
import com.SIMS.Student_Info_Management_System.Service.ProfessorService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/professor")
@SecurityRequirement(name = "Bearer Authentication")
public class ProfessorController {

    @Autowired
    private ProfessorService professorService;


    // =====================================================
    // ADMIN / PROFESSOR MANAGEMENT
    // =====================================================

    @GetMapping("/getData")
    public List<Professors> getAllProfessors() {

        return professorService
                .getAllProfessors();
    }


    // =====================================================
    // ADMIN - CREATE PROFESSOR
    // =====================================================

    @PostMapping("/create")
    public Professors createProfessors(
            @RequestBody Professors professor) {

        return professorService
                .saveProfessors(professor);
    }


    // =====================================================
    // CURRENT LOGGED-IN PROFESSOR
    // =====================================================

    @GetMapping("/me")
    public ResponseEntity<ProfessorDashboardDTO>
    getMyDashboard(
            Authentication authentication) {


        String email =
                authentication.getName();


        ProfessorDashboardDTO dashboard =
                professorService
                        .getProfessorDashboard(
                                email
                        );


        return ResponseEntity.ok(
                dashboard
        );

    }


    // =====================================================
    // UPDATE STUDENT GRADE
    // =====================================================

    @PutMapping(
        "/enrollments/{enrollmentId}/grade"
    )
    public ResponseEntity<ProfessorEnrollmentDTO>
    updateGrade(
            @PathVariable Integer enrollmentId,

            @Valid
            @RequestBody GradeRequest request,

            Authentication authentication) {


        String professorEmail =
                authentication.getName();


        ProfessorEnrollmentDTO updated =
                professorService.updateGrade(
                        professorEmail,
                        enrollmentId,
                        request.getGrade()
                );


        return ResponseEntity.ok(
                updated
        );
    }
     // ADMIN - DELETE PROFESSOR
    // =====================================================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProfessor(
            @PathVariable Integer id) {

        professorService.deleteProfessor(id);

        return ResponseEntity.ok(
            "Professor with id " + id + " deleted successfully"
        );
    }
}
