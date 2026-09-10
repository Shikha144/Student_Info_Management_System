package com.SIMS.Student_Info_Management_System.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SIMS.Student_Info_Management_System.Repo.DepartmentRepo;
import com.SIMS.Student_Info_Management_System.Entity.Department;
import java.util.List;


@Service
public class DepartmentService {
@Autowired
private DepartmentRepo departmentRepo;

public List<Department>getAllDepartments(){
    return departmentRepo.findAll();
}

public Department saveDepartment(Department department){
    return departmentRepo.save(department);

}  
public Department updateDepartment(
            int id,
            Department updatedDepartment) {

        Department existingDepartment = departmentRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Department not found with id: " + id
                    )
                );

        existingDepartment.setDepartment_name(
            updatedDepartment.getDepartment_name()
        );

        existingDepartment.setHead_of_department(
            updatedDepartment.getHead_of_department()
        );

        return departmentRepo.save(existingDepartment);
    }

    public void deleteDepartment(int id) {

        Department existingDepartment =
                departmentRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Department not found with id: " + id
                    )
                );

        departmentRepo.delete(existingDepartment);
    }
}

