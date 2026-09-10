package com.SIMS.Student_Info_Management_System.DTO;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardResponseDTO {
   private long totalStudents;
    private long totalCourses;
    private long activeEnrollments;
    private Map<String, Long> studentsByDepartment;

}
