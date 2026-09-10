package com.SIMS.Student_Info_Management_System.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;

@Service
public class CourseService {

    @Autowired
    private CoursesRepo coursesRepo;

    @Autowired
    private EnrollmentsRepo enrollmentsRepo;


    // =========================
    // GET ALL COURSES
    // =========================
    public List<Course> getAllCourses() {
        return coursesRepo.findAll();
    }


    // =========================
    // CREATE COURSE
    // =========================
    public Course saveCourses(Course course) {
        return coursesRepo.save(course);
    }


    // =========================
    // UPDATE COURSE
    // =========================
    public Course updateCourse(int id, Course updatedCourse) {

        Course existingCourse = coursesRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Course not found with id: " + id
                    )
                );

        existingCourse.setCourse_name(
                updatedCourse.getCourse_name()
        );

        existingCourse.setCredits(
                updatedCourse.getCredits()
        );

        existingCourse.setProfessor(
                updatedCourse.getProfessor()
        );

        return coursesRepo.save(existingCourse);
    }


    // =========================
    // DELETE COURSE
    // =========================
    public void deleteCourse(int id) {

        Course existingCourse = coursesRepo.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found with id: " + id
                    )
                );

        long enrollmentCount =
                enrollmentsRepo.countByCourseId(id);

        if (enrollmentCount > 0) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cannot delete course because "
                + enrollmentCount
                + " student enrollment(s) exist for this course."
            );
        }

        coursesRepo.delete(existingCourse);
    }
}