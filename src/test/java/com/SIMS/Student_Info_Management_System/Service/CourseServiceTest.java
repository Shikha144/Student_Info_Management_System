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

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.SIMS.Student_Info_Management_System.Entity.Course;
import com.SIMS.Student_Info_Management_System.Repo.CoursesRepo;
import com.SIMS.Student_Info_Management_System.Repo.EnrollmentsRepo;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CoursesRepo coursesRepo;

    @Mock
    private EnrollmentsRepo enrollmentsRepo;

    @InjectMocks
    private CourseService courseService;


    private Course course;


    @BeforeEach
    void setUp() {

        course = new Course();

        course.setCourse_id(1);
        course.setCourse_name("Java Programming");
        course.setCredits(3);
    }


    @Test
    void getAllCourses_shouldReturnCourses() {

        when(coursesRepo.findAll())
                .thenReturn(List.of(course));

        List<Course> result =
                courseService.getAllCourses();

        assertEquals(1, result.size());

        assertEquals(
                "Java Programming",
                result.get(0).getCourse_name()
        );

        verify(coursesRepo)
                .findAll();
    }


    @Test
    void saveCourses_shouldSaveCourse() {

        when(coursesRepo.save(course))
                .thenReturn(course);

        Course result =
                courseService.saveCourses(course);

        assertSame(course, result);

        verify(coursesRepo)
                .save(course);
    }


    @Test
    void updateCourse_shouldUpdateExistingCourse() {

        Course updated =
                new Course();

        updated.setCourse_name(
                "Advanced Java"
        );

        updated.setCredits(4);

        when(coursesRepo.findById(1))
                .thenReturn(Optional.of(course));

        when(coursesRepo.save(course))
                .thenReturn(course);

        Course result =
                courseService.updateCourse(
                        1,
                        updated
                );

        assertEquals(
                "Advanced Java",
                result.getCourse_name()
        );

        assertEquals(
                4,
                result.getCredits()
        );

        verify(coursesRepo)
                .findById(1);

        verify(coursesRepo)
                .save(course);
    }


    @Test
    void updateCourse_shouldThrowExceptionWhenNotFound() {

        when(coursesRepo.findById(99))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> courseService.updateCourse(
                        99,
                        new Course()
                )
        );

        verify(coursesRepo, never())
                .save(any(Course.class));
    }


    @Test
    void deleteCourse_shouldDeleteWhenNoEnrollmentsExist() {

        when(coursesRepo.findById(1))
                .thenReturn(Optional.of(course));

        when(enrollmentsRepo.countByCourseId(1))
                .thenReturn(0L);

        courseService.deleteCourse(1);

        verify(coursesRepo)
                .findById(1);

        verify(enrollmentsRepo)
                .countByCourseId(1);

        verify(coursesRepo)
                .delete(course);
    }


    @Test
    void deleteCourse_shouldRejectWhenEnrollmentsExist() {

        when(coursesRepo.findById(1))
                .thenReturn(Optional.of(course));

        when(enrollmentsRepo.countByCourseId(1))
                .thenReturn(3L);

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> courseService.deleteCourse(1)
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertTrue(
                exception.getReason()
                        .contains("3 student enrollment")
        );

        verify(coursesRepo, never())
                .delete(any(Course.class));
    }


    @Test
    void deleteCourse_shouldReturnNotFoundWhenCourseDoesNotExist() {

        when(coursesRepo.findById(99))
                .thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> courseService.deleteCourse(99)
                );

        assertEquals(
                HttpStatus.NOT_FOUND,
                exception.getStatusCode()
        );

        verify(enrollmentsRepo, never())
                .countByCourseId(anyInt());

        verify(coursesRepo, never())
                .delete(any(Course.class));
    }
}