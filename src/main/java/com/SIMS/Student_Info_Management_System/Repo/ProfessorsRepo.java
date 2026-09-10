package com.SIMS.Student_Info_Management_System.Repo;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.SIMS.Student_Info_Management_System.Entity.Professors;

@Repository
public interface ProfessorsRepo extends JpaRepository<Professors,Integer> {
    Professors findByEmail(String email);

}
