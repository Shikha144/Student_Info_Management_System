package com.SIMS.Student_Info_Management_System.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.SIMS.Student_Info_Management_System.Entity.Students;

@Repository
public interface StudentRepo  extends JpaRepository<Students,Integer>{
    

    Students findByEmail(String email);
@Query
("""
        SELECT d.department_name, COUNT(s)
        FROM Students s
        JOIN s.department d
        GROUP BY d.department_name
    """)
    List<Object[]> countStudentsByDepartment();
}
