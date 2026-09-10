package com.SIMS.Student_Info_Management_System.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.SIMS.Student_Info_Management_System.Entity.enrollments;

@Repository
public interface EnrollmentsRepo extends JpaRepository<enrollments, Integer> {

    long countByStatus(String status);

    @Query("""
        SELECT e
        FROM enrollments e
        WHERE e.student.student_id = :studentId
    """)
    List<enrollments> findEnrollmentsByStudentId(
            @Param("studentId") Integer studentId
    );

    @Query("""
        SELECT COUNT(e)
        FROM enrollments e
        WHERE e.course.course_id = :courseId
    """)
    long countByCourseId(
            @Param("courseId") Integer courseId
    );
    @Query("""
    SELECT COUNT(e) > 0
    FROM enrollments e
    WHERE e.student.student_id = :studentId
    AND e.course.course_id = :courseId
""")
boolean existsEnrollment(
        @Param("studentId") Integer studentId,
        @Param("courseId") Integer courseId
);
}