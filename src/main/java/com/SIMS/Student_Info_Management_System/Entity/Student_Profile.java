package com.SIMS.Student_Info_Management_System.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.JoinColumn;
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name="student_profiles")
public class Student_Profile {
    @Id
    private int profile_id;
    private String address;
    private String phone_number;
    @OneToOne
    @JoinColumn(name="student_id")
    @JsonIgnore
    private Students student;

}
