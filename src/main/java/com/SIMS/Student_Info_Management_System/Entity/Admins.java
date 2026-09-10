package com.SIMS.Student_Info_Management_System.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="admins")
public class Admins {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     private int admin_id;
     private String username;
    private String email;
    private String password;
    private String role;


}
