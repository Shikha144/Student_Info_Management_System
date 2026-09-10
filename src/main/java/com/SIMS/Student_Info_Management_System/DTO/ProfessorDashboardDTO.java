package com.SIMS.Student_Info_Management_System.DTO;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter 
@Setter 
@NoArgsConstructor 
public class ProfessorDashboardDTO {

    private int professor_id;
    private String professor_name;
    private String email;
    private String role;

    private List<ProfessorCourseDTO> courses;

}
