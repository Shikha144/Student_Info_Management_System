package com.SIMS.Student_Info_Management_System.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.SIMS.Student_Info_Management_System.Entity.Student_Profile;
import java.util.List;

import com.SIMS.Student_Info_Management_System.Service.Student_ProfileService;

@RestController
@RequestMapping("/studentProfile")

public class StudentProfileController {
    @Autowired
    private Student_ProfileService studentservice;

    @GetMapping("/getData")
    public List<Student_Profile> getAllStudentProfiles(){
        return studentservice.getAllStudentProfiles();
    }
    @PostMapping("/create")
    public Student_Profile createStudentProfile(@RequestBody Student_Profile studentProfile)
    {
        return studentservice.saveStudentProfile(studentProfile);
    }

}
