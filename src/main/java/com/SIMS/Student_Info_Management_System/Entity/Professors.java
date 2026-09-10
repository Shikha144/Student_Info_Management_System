package com.SIMS.Student_Info_Management_System.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "professors")
public class Professors {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int professor_id;

    @Column(name = "professor_name", nullable = false)
    private String professor_name;

    @Column(name = "email", nullable = false)
    private String email;

    @JsonIgnore
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role", nullable = false)
    private String role;

    @OneToMany(
        mappedBy = "professor",
        cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private List<Course> courses;
}