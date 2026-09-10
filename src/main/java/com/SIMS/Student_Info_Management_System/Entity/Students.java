package com.SIMS.Student_Info_Management_System.Entity;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name="students")

public class Students {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int student_id;
    @Column(name = "first_name")

    private String firstName;
@Column(name = "last_name")
private String lastName;    
private String email;
    private String password;
    private String role;
@ManyToOne
@JoinColumn(name="department_id")
    private Department department;
//student is the variable created in student profile class to map the relationship between student and student profile
    @OneToOne(mappedBy="student", cascade=CascadeType.ALL, optional=true)
    private Student_Profile profile;

    @OneToMany(mappedBy="student",cascade=CascadeType.ALL)
    private List<enrollments>enrollments;

    

}
