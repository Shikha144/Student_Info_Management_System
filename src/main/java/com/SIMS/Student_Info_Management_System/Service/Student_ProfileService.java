package com.SIMS.Student_Info_Management_System.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.SIMS.Student_Info_Management_System.Repo.Student_ProfileRepo;
import com.SIMS.Student_Info_Management_System.Entity.Student_Profile;
import java.util.List;

@Service
public class Student_ProfileService {
    @Autowired
    private Student_ProfileRepo studentpro;

    public List<Student_Profile> getAllStudentProfiles(){
        return studentpro.findAll();
    }
    public Student_Profile saveStudentProfile(Student_Profile studentProfile){
        return studentpro.save(studentProfile);
    }

}
