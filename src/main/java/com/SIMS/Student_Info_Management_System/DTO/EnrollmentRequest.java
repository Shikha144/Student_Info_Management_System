package com.SIMS.Student_Info_Management_System.DTO;
import org.antlr.v4.runtime.misc.NotNull;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class EnrollmentRequest {

    @NotNull
    @Min(1)
    private  Integer student_id;
    private int course_id;
    private String grade;

}
