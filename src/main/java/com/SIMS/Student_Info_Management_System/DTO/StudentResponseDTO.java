package com.SIMS.Student_Info_Management_System.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentResponseDTO {
private int student_id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;

}

