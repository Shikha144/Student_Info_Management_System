package com.SIMS.Student_Info_Management_System.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "courses")
public class Course {

    @Id
    private int course_id;

    private String course_name;

    private int credits;

    @ManyToOne
    @JoinColumn(
        name = "professor_id",
        referencedColumnName = "professor_id"
    )
    @JsonBackReference
    private Professors professor;

    @OneToMany(mappedBy = "course")
    private List<enrollments> enrollments;
}