package com.SIMS.Student_Info_Management_System.DTO;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProfessorEnrollmentDTO {

    private Integer enrollment_id;

    private Integer student_id;

    private String student_first_name;

    private String student_last_name;

    private String student_email;

    private String grade;

    private String status;

    private LocalDate enrollment_date;
}