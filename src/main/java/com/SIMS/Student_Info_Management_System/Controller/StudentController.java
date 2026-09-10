package com.SIMS.Student_Info_Management_System.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.SIMS.Student_Info_Management_System.Service.AuthService;
import com.SIMS.Student_Info_Management_System.Service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import com.SIMS.Student_Info_Management_System.Entity.Students;
import com.SIMS.Student_Info_Management_System.DTO.StudentResponseDTO;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
@RestController
@RequestMapping("/student")
@SecurityRequirement(name = "Bearer Authentication")
public class StudentController {
    @Autowired
    private StudentService studentService;

    @Autowired
    private AuthService service;

//pagination
   @GetMapping("/AllStudents")
public Page<StudentResponseDTO> 
getStudents( @RequestParam(defaultValue = "0") int page, 
@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "lastName")  
String sort) { return studentService.getStudents(page, size, sort) 
    .map(student -> { StudentResponseDTO dto = new StudentResponseDTO(); 
        dto.setStudent_id(student.getStudent_id()); 
        dto.setFirstName(student.getFirstName()); 
        dto.setLastName(student.getLastName()); 
        dto.setEmail(student.getEmail()); 
        dto.setRole(student.getRole()); return dto; }); }






//get all students
   @GetMapping("/getData")
public List<StudentResponseDTO> getAllStudents() {
     List<StudentResponseDTO> students = studentService.getAllStudents()
        .stream()
        .map(student -> {
            StudentResponseDTO dto = new StudentResponseDTO();

            dto.setStudent_id(student.getStudent_id());
            dto.setFirstName(student.getFirstName());
            dto.setLastName(student.getLastName());
            dto.setEmail(student.getEmail());
            dto.setRole(student.getRole());

            return dto;
        })
        .collect(Collectors.toList());

    return students;

}
    
//get student by id
@GetMapping("/id/{id}")
public StudentResponseDTO getStudentById(@PathVariable int id) {

    Students student = studentService.getStudentById(id);

    StudentResponseDTO dto = new StudentResponseDTO();

    dto.setStudent_id(student.getStudent_id());
    dto.setFirstName(student.getFirstName());
    dto.setLastName(student.getLastName());
    dto.setEmail(student.getEmail());
    dto.setRole(student.getRole());

    return dto;
}

//register new students
@PostMapping("/register")

public StudentResponseDTO createStudents(
        @RequestBody Students student) {

    Students savedStudent = studentService.saveStudents(student);

    StudentResponseDTO dto = new StudentResponseDTO();

    dto.setStudent_id(savedStudent.getStudent_id());
    dto.setFirstName(savedStudent.getFirstName());
    dto.setLastName(savedStudent.getLastName());
    dto.setEmail(savedStudent.getEmail());
    dto.setRole(savedStudent.getRole());

    return dto;
}
// update student by id
@PutMapping("/update/{id}")
public StudentResponseDTO updateStudent(@PathVariable int id, @RequestBody Students updatedStudentDetails) {
    Students student = studentService.getStudentById(id);
    
    student.setFirstName(updatedStudentDetails.getFirstName());
    student.setLastName(updatedStudentDetails.getLastName());
    student.setEmail(updatedStudentDetails.getEmail());
    // update other fields as needed

    Students savedStudent = studentService.saveStudents(student);

    StudentResponseDTO dto = new StudentResponseDTO();
    dto.setStudent_id(savedStudent.getStudent_id());
    dto.setFirstName(savedStudent.getFirstName());
    dto.setLastName(savedStudent.getLastName());
    dto.setEmail(savedStudent.getEmail());
    dto.setRole(savedStudent.getRole());

    return dto;
}
//delete student by id
@DeleteMapping("/delete/{id}")
public ResponseEntity<String> deleteStudents(@PathVariable int id) {

    studentService.deleteStudentById(id);

    return ResponseEntity.ok(
            "Student with id " + id + " deleted successfully"
    );
}

@PostMapping("/login")
public String login(@RequestBody Students student){
    return service.Verify(student.getEmail(), student.getPassword());
}

@GetMapping("/me")
public StudentResponseDTO getMyProfile(
        Authentication authentication) {

    String email = authentication.getName();

    Students student =
            studentService.getStudentByEmail(email);

    StudentResponseDTO dto =
            new StudentResponseDTO();

    dto.setStudent_id(
            student.getStudent_id());

    dto.setFirstName(
            student.getFirstName());

    dto.setLastName(
            student.getLastName());

    dto.setEmail(
            student.getEmail());

    dto.setRole(
            student.getRole());

    return dto;
}
@PutMapping("/me")
public StudentResponseDTO updateMyProfile(
        @RequestBody Students updatedStudentDetails,
        Authentication authentication) {

    String email = authentication.getName();

    Students student =
            studentService.getStudentByEmail(email);

    student.setFirstName(
            updatedStudentDetails.getFirstName()
    );

    student.setLastName(
            updatedStudentDetails.getLastName()
    );

    student.setEmail(
            updatedStudentDetails.getEmail()
    );

    Students savedStudent =
            studentService.saveStudentsWithoutEncoding(student);

    StudentResponseDTO dto =
            new StudentResponseDTO();

    dto.setStudent_id(
            savedStudent.getStudent_id()
    );

    dto.setFirstName(
            savedStudent.getFirstName()
    );

    dto.setLastName(
            savedStudent.getLastName()
    );

    dto.setEmail(
            savedStudent.getEmail()
    );

    dto.setRole(
            savedStudent.getRole()
    );

    return dto;
}


@PostMapping("/admin/create")
public ResponseEntity<StudentResponseDTO> createStudentByAdmin(
        @RequestBody Students student) {

    student.setRole("STUDENT");

    Students savedStudent =
            studentService.saveStudents(student);

    StudentResponseDTO dto =
            new StudentResponseDTO();

    dto.setStudent_id(
            savedStudent.getStudent_id()
    );

    dto.setFirstName(
            savedStudent.getFirstName()
    );

    dto.setLastName(
            savedStudent.getLastName()
    );

    dto.setEmail(
            savedStudent.getEmail()
    );

    dto.setRole(
            savedStudent.getRole()
    );

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(dto);
}
}