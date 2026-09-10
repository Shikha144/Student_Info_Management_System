package com.SIMS.Student_Info_Management_System.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.SIMS.Student_Info_Management_System.Entity.Admins;
@Repository

public interface AdminsRepo extends JpaRepository<Admins,Integer> {
    //Optional<Admins>findByEmail(String email);
        Admins findByEmail(String email);


}
