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
import com.SIMS.Student_Info_Management_System.Service.CourseService;
import java.util.List;
import com.SIMS.Student_Info_Management_System.Entity.Course;

@RestController
@RequestMapping("/courses")
public class CoursesController {
    @Autowired
    private CourseService courseService;
@GetMapping("/getCourses")
   public List<Course> getAllCourses(){
        return courseService.getAllCourses();
    }

    @PostMapping("/create")
    public Course createCourses(@RequestBody Course course){
        return courseService.saveCourses(course);
    }
@PutMapping("/update/{id}")
    public Course updateCourse(
            @PathVariable int id,
            @RequestBody Course course) {

        return courseService.updateCourse(id, course);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable int id) {

        courseService.deleteCourse(id);

        return "Course deleted successfully";
    }
}

