package com.SIMS.Student_Info_Management_System.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SIMS.Student_Info_Management_System.Entity.Department;
import com.SIMS.Student_Info_Management_System.Service.DepartmentService;
import java.util.List;

@RestController
@RequestMapping("/api/department")

public class DepartmentController {
@Autowired
private DepartmentService departmentService;

@GetMapping("/getData")

public List<Department>getAllDepartments(){
    return departmentService.getAllDepartments();
}

@PostMapping("/create")

public Department createDepartment(@RequestBody Department department){
    return departmentService.saveDepartment(department);

}

    @PutMapping("/update/{id}")
    public Department updateDepartment(
            @PathVariable int id,
            @RequestBody Department department) {

        return departmentService.updateDepartment(id, department);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteDepartment(@PathVariable int id) {

        departmentService.deleteDepartment(id);

        return "Department deleted successfully";
    }
}
