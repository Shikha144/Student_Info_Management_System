package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.SIMS.Student_Info_Management_System.Entity.Department;
import com.SIMS.Student_Info_Management_System.Repo.DepartmentRepo;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepo departmentRepo;

    @InjectMocks
    private DepartmentService departmentService;


    private Department department;


    @BeforeEach
    void setUp() {

        department = new Department();

        department.setDepartment_id(1);
        department.setDepartment_name("Computer Science");
        department.setHead_of_department("Dr. Smith");
    }


    @Test
    void getAllDepartments_shouldReturnDepartments() {

        when(departmentRepo.findAll())
                .thenReturn(List.of(department));

        List<Department> result =
                departmentService.getAllDepartments();

        assertEquals(1, result.size());

        assertEquals(
                "Computer Science",
                result.get(0).getDepartment_name()
        );

        verify(departmentRepo)
                .findAll();
    }


    @Test
    void saveDepartment_shouldSaveDepartment() {

        when(departmentRepo.save(department))
                .thenReturn(department);

        Department result =
                departmentService.saveDepartment(
                        department
                );

        assertSame(department, result);

        verify(departmentRepo)
                .save(department);
    }


    @Test
    void updateDepartment_shouldUpdateExistingDepartment() {

        Department updated =
                new Department();

        updated.setDepartment_name(
                "Information Technology"
        );

        updated.setHead_of_department(
                "Dr. Johnson"
        );

        when(departmentRepo.findById(1))
                .thenReturn(Optional.of(department));

        when(departmentRepo.save(department))
                .thenReturn(department);

        Department result =
                departmentService.updateDepartment(
                        1,
                        updated
                );

        assertEquals(
                "Information Technology",
                result.getDepartment_name()
        );

        assertEquals(
                "Dr. Johnson",
                result.getHead_of_department()
        );

        verify(departmentRepo)
                .findById(1);

        verify(departmentRepo)
                .save(department);
    }


    @Test
    void updateDepartment_shouldThrowExceptionWhenNotFound() {

        Department updated =
                new Department();

        when(departmentRepo.findById(99))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> departmentService.updateDepartment(
                                99,
                                updated
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Department not found")
        );

        verify(departmentRepo, never())
                .save(any(Department.class));
    }


    @Test
    void deleteDepartment_shouldDeleteExistingDepartment() {

        when(departmentRepo.findById(1))
                .thenReturn(Optional.of(department));

        departmentService.deleteDepartment(1);

        verify(departmentRepo)
                .findById(1);

        verify(departmentRepo)
                .delete(department);
    }


    @Test
    void deleteDepartment_shouldThrowExceptionWhenNotFound() {

        when(departmentRepo.findById(99))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> departmentService.deleteDepartment(99)
        );

        verify(departmentRepo, never())
                .delete(any(Department.class));
    }
}