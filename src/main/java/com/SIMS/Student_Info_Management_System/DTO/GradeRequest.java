package com.SIMS.Student_Info_Management_System.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GradeRequest {

    @NotBlank(message = "Grade is required")
    private String grade;
}