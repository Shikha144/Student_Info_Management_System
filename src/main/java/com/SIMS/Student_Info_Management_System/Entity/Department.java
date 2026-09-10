package com.SIMS.Student_Info_Management_System.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="department_id")//by mentioning exact column name here we can use department or jus id in "private long __"
    private int department_id;

    @Column(name="department_name")
    private String department_name;

    @Column(name="head_of_department")
    private String head_of_department;

}
