package com.SIMS.Student_Info_Management_System.Entity;

import java.time.LocalDate;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GenerationType;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class enrollments {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Integer enrollment_id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false,referencedColumnName = "student_id")
    @JsonIgnore
    private Students student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false,referencedColumnName = "course_id")
    @JsonIgnore//this stps jackson from looping back into course/enrollments endlessly

    private Course course;
    private String grade;
    private LocalDate enrollment_date ;
    private String status;


}
