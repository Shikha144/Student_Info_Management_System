package com.SIMS.Student_Info_Management_System.DTO;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProfessorCourseDTO {

    private int course_id;

    private String course_name;

    private int credits;

    private List<ProfessorEnrollmentDTO> enrollments;
}