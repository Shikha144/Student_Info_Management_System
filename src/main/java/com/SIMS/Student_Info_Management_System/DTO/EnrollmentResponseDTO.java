package com.SIMS.Student_Info_Management_System.DTO;


import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnrollmentResponseDTO {

    private Integer enrollment_id;

    private Integer course_id;

    private String course_name;

    private LocalDate enrollment_date;

    private String status;

    private String grade;

    private Integer credits;
}


