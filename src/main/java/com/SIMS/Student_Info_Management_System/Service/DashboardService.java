package com.SIMS.Student_Info_Management_System.Service;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.DTO.DashboardResponseDTO;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;

@Service
public class DashboardService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private CoursesRepo coursesRepo;

    @Autowired
    private EnrollmentsRepo enrollmentsRepo;


    public DashboardResponseDTO getDashboardData() {

        DashboardResponseDTO dashboard = new DashboardResponseDTO();

        // Total students
        long totalStudents = studentRepo.count();

        // Total courses
        long totalCourses = coursesRepo.count();

        // Active enrollments
        long activeEnrollments = enrollmentsRepo.countByStatus("ACTIVE");

        // Students grouped by department
        List<Students> students = studentRepo.findAll();

        Map<String, Long> studentsByDepartment = students.stream()
                .filter(student -> student.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        student -> student.getDepartment().getDepartment_name(),
                        Collectors.counting()
                ));

        dashboard.setTotalStudents(totalStudents);
        dashboard.setTotalCourses(totalCourses);
        dashboard.setActiveEnrollments(activeEnrollments);
        dashboard.setStudentsByDepartment(studentsByDepartment);

        return dashboard;
    }

}
