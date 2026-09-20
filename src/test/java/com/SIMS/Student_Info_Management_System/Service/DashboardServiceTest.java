package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.SIMS.Student_Info_Management_System.DTO.DashboardResponseDTO;
import com.SIMS.Student_Info_Management_System.Entity.Department;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private StudentRepo studentRepo;

    @Mock
    private CoursesRepo coursesRepo;

    @Mock
    private EnrollmentsRepo enrollmentsRepo;

    @InjectMocks
    private DashboardService dashboardService;


    @Test
    void getDashboardData_shouldReturnCorrectCounts() {

        Department department =
                new Department();

        department.setDepartment_name(
                "Computer Science"
        );


        Students student1 =
                new Students();

        student1.setDepartment(department);


        Students student2 =
                new Students();

        student2.setDepartment(department);


        when(studentRepo.count())
                .thenReturn(2L);

        when(coursesRepo.count())
                .thenReturn(5L);

        when(enrollmentsRepo.countByStatus("ACTIVE"))
                .thenReturn(3L);

        when(studentRepo.findAll())
                .thenReturn(
                        List.of(
                                student1,
                                student2
                        )
                );


        DashboardResponseDTO result =
                dashboardService.getDashboardData();


        assertNotNull(result);

        assertEquals(
                2L,
                result.getTotalStudents()
        );

        assertEquals(
                5L,
                result.getTotalCourses()
        );

        assertEquals(
                3L,
                result.getActiveEnrollments()
        );

        assertEquals(
                2L,
                result.getStudentsByDepartment()
                        .get("Computer Science")
        );


        verify(studentRepo)
                .count();

        verify(coursesRepo)
                .count();

        verify(enrollmentsRepo)
                .countByStatus("ACTIVE");

        verify(studentRepo)
                .findAll();
    }
}