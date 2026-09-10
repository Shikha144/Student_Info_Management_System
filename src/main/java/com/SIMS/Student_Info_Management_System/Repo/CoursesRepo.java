package com.SIMS.Student_Info_Management_System.Repo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SIMS.Student_Info_Management_System.Entity.Course;
@Repository

public interface CoursesRepo extends JpaRepository<Course,Integer> {
}
