package com.SIMS.Student_Info_Management_System.DTO;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminEnrollmentDTO {

    private Integer enrollment_id;

    // Student information
    private Integer student_id;
    private String student_name;
    private String student_email;

    // Course information
    private Integer course_id;
    private String course_name;
    private Integer credits;

    // Enrollment information
    private String grade;
    private LocalDate enrollment_date;
    private String status;
}
