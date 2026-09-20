package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.SIMS.Student_Info_Management_System.Entity.Student_Profile;
import com.SIMS.Student_Info_Management_System.Repo.Student_ProfileRepo;

@ExtendWith(MockitoExtension.class)
class Student_ProfileServiceTest {

    @Mock
    private Student_ProfileRepo studentProfileRepo;

    @InjectMocks
    private Student_ProfileService studentProfileService;


    @Test
    void getAllStudentProfiles_shouldReturnProfiles() {

        Student_Profile profile =
                new Student_Profile();

        when(studentProfileRepo.findAll())
                .thenReturn(List.of(profile));

        List<Student_Profile> result =
                studentProfileService
                        .getAllStudentProfiles();

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(studentProfileRepo)
                .findAll();
    }


    @Test
    void saveStudentProfile_shouldSaveProfile() {

        Student_Profile profile =
                new Student_Profile();

        when(studentProfileRepo.save(profile))
                .thenReturn(profile);

        Student_Profile result =
                studentProfileService
                        .saveStudentProfile(profile);

        assertSame(
                profile,
                result
        );

        verify(studentProfileRepo)
                .save(profile);
    }
}