package com.SIMS.Student_Info_Management_System.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.Repo.StudentRepo;
import com.SIMS.Student_Info_Management_System.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepo studentRepo;

    @InjectMocks
    private StudentService studentService;

    private Students student;

    @BeforeEach
    void setUp() {

        student = new Students();

        student.setStudent_id(1);
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail("john@example.com");
        student.setPassword("password123");
        student.setRole("STUDENT");
    }


    // =====================================================
    // getAllStudents()
    // =====================================================

    @Test
    void getAllStudents_shouldReturnAllStudents() {

        List<Students> students =
                List.of(student);

        when(studentRepo.findAll())
                .thenReturn(students);

        List<Students> result =
                studentService.getAllStudents();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(
                "john@example.com",
                result.get(0).getEmail()
        );

        verify(studentRepo, times(1))
                .findAll();
    }


    // =====================================================
    // getStudentById() - success
    // =====================================================

    @Test
    void getStudentById_shouldReturnStudent() {

        when(studentRepo.findById(1))
                .thenReturn(Optional.of(student));

        Students result =
                studentService.getStudentById(1);

        assertNotNull(result);
        assertEquals(
                1,
                result.getStudent_id()
        );

        assertEquals(
                "john@example.com",
                result.getEmail()
        );

        verify(studentRepo)
                .findById(1);
    }


    // =====================================================
    // getStudentById() - not found
    // =====================================================

    @Test
    void getStudentById_shouldThrowExceptionWhenNotFound() {

        when(studentRepo.findById(99))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> studentService.getStudentById(99)
                );

        assertTrue(
                exception.getMessage()
                        .contains("Student not found")
        );

        verify(studentRepo)
                .findById(99);
    }


    // =====================================================
    // getStudentByEmail() - success
    // =====================================================

    @Test
    void getStudentByEmail_shouldReturnStudent() {

        when(studentRepo.findByEmail("john@example.com"))
                .thenReturn(student);

        Students result =
                studentService.getStudentByEmail(
                        "john@example.com"
                );

        assertNotNull(result);

        assertEquals(
                "john@example.com",
                result.getEmail()
        );

        verify(studentRepo)
                .findByEmail("john@example.com");
    }


    // =====================================================
    // getStudentByEmail() - not found
    // =====================================================

    @Test
    void getStudentByEmail_shouldThrowExceptionWhenNotFound() {

        when(studentRepo.findByEmail("missing@example.com"))
                .thenReturn(null);

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> studentService.getStudentByEmail(
                                "missing@example.com"
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Student not found")
        );
    }


    // =====================================================
    // loadUserByUsername() - success
    // =====================================================

    @Test
    void loadUserByUsername_shouldReturnUserDetails() {

        String encodedPassword =
                new BCryptPasswordEncoder(12)
                        .encode("password123");

        student.setPassword(encodedPassword);
        student.setRole("STUDENT");

        when(studentRepo.findByEmail("john@example.com"))
                .thenReturn(student);

        UserDetails userDetails =
                studentService.loadUserByUsername(
                        "john@example.com"
                );

        assertNotNull(userDetails);

        assertEquals(
                "john@example.com",
                userDetails.getUsername()
        );

        assertEquals(
                encodedPassword,
                userDetails.getPassword()
        );

        assertTrue(
                userDetails.getAuthorities()
                        .stream()
                        .anyMatch(a ->
                                a.getAuthority()
                                        .equals("ROLE_STUDENT")
                        )
        );
    }


    // =====================================================
    // loadUserByUsername() - user not found
    // =====================================================

    @Test
    void loadUserByUsername_shouldThrowExceptionWhenUserNotFound() {

        when(studentRepo.findByEmail("missing@example.com"))
                .thenReturn(null);

        assertThrows(
                UsernameNotFoundException.class,
                () -> studentService.loadUserByUsername(
                        "missing@example.com"
                )
        );
    }


    // =====================================================
    // loadUserByUsername() - missing role
    // =====================================================

    @Test
    void loadUserByUsername_shouldThrowExceptionWhenRoleMissing() {

        student.setRole(null);

        when(studentRepo.findByEmail("john@example.com"))
                .thenReturn(student);

        assertThrows(
                UsernameNotFoundException.class,
                () -> studentService.loadUserByUsername(
                        "john@example.com"
                )
        );
    }


    // =====================================================
    // saveStudents() - default role + password encoding
    // =====================================================

    @Test
    void saveStudents_shouldSetDefaultRoleAndEncodePassword() {

        Students newStudent = new Students();

        newStudent.setEmail("new@example.com");
        newStudent.setPassword("plainPassword");
        newStudent.setRole(null);

        when(studentRepo.save(any(Students.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        Students result =
                studentService.saveStudents(newStudent);

        assertEquals(
                "STUDENT",
                result.getRole()
        );

        assertNotEquals(
                "plainPassword",
                result.getPassword()
        );

        assertTrue(
                new BCryptPasswordEncoder(12)
                        .matches(
                                "plainPassword",
                                result.getPassword()
                        )
        );

        verify(studentRepo)
                .save(newStudent);
    }


    // =====================================================
    // saveStudents() - ROLE_ normalization
    // =====================================================

    @Test
    void saveStudents_shouldNormalizeRole() {

        Students newStudent = new Students();

        newStudent.setEmail("new@example.com");
        newStudent.setPassword("password123");
        newStudent.setRole("ROLE_STUDENT");

        when(studentRepo.save(any(Students.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        Students result =
                studentService.saveStudents(newStudent);

        assertEquals(
                "STUDENT",
                result.getRole()
        );
    }


    // =====================================================
    // saveStudentsWithoutEncoding()
    // =====================================================

    @Test
    void saveStudentsWithoutEncoding_shouldSaveStudentDirectly() {

        String encodedPassword =
                "$2a$12$alreadyEncodedPassword";

        student.setPassword(encodedPassword);

        when(studentRepo.save(student))
                .thenReturn(student);

        Students result =
                studentService.saveStudentsWithoutEncoding(
                        student
                );

        assertSame(student, result);

        assertEquals(
                encodedPassword,
                result.getPassword()
        );

        verify(studentRepo)
                .save(student);
    }


    // =====================================================
    // getStudents() - pagination
    // =====================================================

    @Test
    void getStudents_shouldReturnPagedStudents() {

        PageRequest pageable =
                PageRequest.of(
                        0,
                        5
                );

        Page<Students> page =
                new PageImpl<>(
                        List.of(student),
                        pageable,
                        1
                );

        when(studentRepo.findAll(any(PageRequest.class)))
                .thenReturn(page);

        Page<Students> result =
                studentService.getStudents(
                        0,
                        5,
                        "lastName"
                );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(
                "john@example.com",
                result.getContent()
                        .get(0)
                        .getEmail()
        );

        verify(studentRepo)
                .findAll(any(PageRequest.class));
    }


    // =====================================================
    // deleteStudentById() - success
    // =====================================================

    @Test
    void deleteStudentById_shouldDeleteExistingStudent() {

        when(studentRepo.findById(1))
                .thenReturn(Optional.of(student));

        doNothing()
                .when(studentRepo)
                .delete(student);

        studentService.deleteStudentById(1);

        verify(studentRepo)
                .findById(1);

        verify(studentRepo)
                .delete(student);
    }


    // =====================================================
    // deleteStudentById() - not found
    // =====================================================

    @Test
    void deleteStudentById_shouldThrowExceptionWhenStudentNotFound() {

        when(studentRepo.findById(99))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> studentService.deleteStudentById(99)
        );

        verify(studentRepo, never())
                .delete(any(Students.class));
    }
}