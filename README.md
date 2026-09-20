# 🎓 Student Information Management System

A full-stack **Student Information Management System (SIMS)** built with **React, Spring Boot, PostgreSQL, Spring Security, JWT authentication, and role-based access control**.

The application provides role-specific functionality for **Administrators, Professors, and Students**, with a React frontend communicating with a Spring Boot REST API backed by PostgreSQL.

---

## 🚀 Live Demo

### 🌐 Live Application

**Frontend:** https://student-info-management-system-frontend.onrender.com

### 📚 Swagger API Documentation

**Swagger UI:** https://student-info-management-system-g7v0.onrender.com/swagger-ui/index.html

### ⚙️ Backend API

**Spring Boot Backend:** https://student-info-management-system-g7v0.onrender.com

> **Note:** The application is deployed on Render. Initial requests may take a little longer if a service has been idle.

---

# 🔐 Demo Access

Demo accounts are available for exploring the application's different role-based workflows.

| Role            | Demo Email                |
| --------------- | ------------------------- |
| 👨‍💼 Admin     | `demo.admin@sims.com`     |
| 👨‍🏫 Professor | `demo.professor@sims.com` |
| 🎓 Student      | `demo.student@sims.com`   |

**Demo Password:** `demo123`

> These accounts are provided only for application demonstration and testing. Please do not enter sensitive personal information.

---

# 🎯 What You Can Explore

### 👨‍💼 Admin

The Admin dashboard provides management functionality for:

* Students
* Professors
* Courses
* Departments
* Enrollments
* Grades
* Enrollment status
* Academic records

### 👨‍🏫 Professor

The Professor dashboard provides access to:

* Professor profile
* Enrollment information
* Student enrollment records
* Course-related academic information
* Grade management

### 🎓 Student

The Student dashboard provides access to:

* Student profile
* Available courses
* Enrollment information
* Personal academic information
* Student-specific resources

---

# ✨ Key Features

## 🔑 Authentication & Authorization

* JWT-based authentication
* Spring Security
* BCrypt password hashing
* Role-Based Access Control (RBAC)
* Protected REST API endpoints
* Role-specific frontend routes
* JWT token management
* Logout functionality

Supported roles:

```text
ROLE_ADMIN
ROLE_PROFESSOR
ROLE_STUDENT
```

---

## 👨‍💼 Administrative Management

Administrators can manage core academic data through the dashboard:

* Create, update, view, and delete student records
* Manage professor records
* Manage courses
* Manage departments
* Manage enrollments
* View enrollment grades and statuses
* Access centralized academic information

---

## 👨‍🏫 Professor Management

Professors can:

* Access their dashboard
* View their profile
* View student enrollment information
* Review enrollment records
* Update grades where authorized

---

## 🎓 Student Management

Students can:

* Access their dashboard
* View their profile
* Browse available courses
* View enrollment information
* Access their academic information

---

# 🛠️ Technology Stack

## Frontend

* **React**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Vite**
* **React Router**
* REST API integration
* JWT-based authentication handling

## Backend

* **Java 17**
* **Spring Boot**
* **Spring MVC**
* **Spring Data JPA**
* **Hibernate**
* **REST APIs**
* **DTOs**
* **Maven**

## Security

* **Spring Security**
* **JWT**
* **BCrypt**
* **Role-Based Access Control**
* Protected API endpoints
* CORS configuration

## Database

* **PostgreSQL**

## Testing

* **JUnit 5**
* **Mockito**
* **Maven Surefire**

## API & Development Tools

* **Swagger / OpenAPI**
* **Postman**
* **Git**
* **GitHub**

## Deployment

* **Render**

---

# 🏗️ Application Architecture

```text
                         ┌──────────────────────────┐
                         │      React Frontend      │
                         │    Vite + React Router   │
                         └────────────┬─────────────┘
                                      │
                               HTTP / JSON
                                      │
                              JWT Authorization
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │    Spring Boot REST API  │
                         │                          │
                         │ Controllers              │
                         │ Services                 │
                         │ DTOs                     │
                         │ Security / JWT           │
                         └────────────┬─────────────┘
                                      │
                               JPA / Hibernate
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       PostgreSQL         │
                         │                          │
                         │ Students                 │
                         │ Student Profiles         │
                         │ Professors               │
                         │ Courses                  │
                         │ Departments              │
                         │ Enrollments              │
                         │ Admins                   │
                         └──────────────────────────┘
```

---

# 🔒 Security Architecture

The application uses **Spring Security, JWT, BCrypt, and role-based authorization**.

The authentication flow is:

```text
User Login
    │
    ▼
Authentication Endpoint
    │
    ▼
Credentials Validation
    │
    ▼
JWT Token Generated
    │
    ▼
Frontend Stores Token
    │
    ▼
Authorization Header
Bearer <JWT>
    │
    ▼
JWT Filter
    │
    ▼
Role-Based Authorization
    │
    ▼
Protected REST Endpoint
```

Passwords are stored using **BCrypt hashing** rather than plain text.

Protected resources are authorized according to the authenticated user's role.

---

# 🗄️ Database Design

The application uses **PostgreSQL** with **Spring Data JPA / Hibernate** for persistence.

### Core Entities

* `Students`
* `Student Profiles`
* `Professors`
* `Courses`
* `Departments`
* `Enrollments`
* `Admins`

### Entity Relationships

The application uses JPA relationships including:

* `@OneToOne`
* `@ManyToOne`
* Foreign-key relationships
* Entity associations managed through Hibernate

Enrollment records associate students with courses and include information such as:

* Enrollment date
* Grade
* Status

---

# 📚 REST API & Swagger

The backend exposes RESTful endpoints for authentication, student management, professors, courses, departments, and enrollments.

Interactive API documentation is available through Swagger UI:

**Swagger UI:** https://student-info-management-system-g7v0.onrender.com/swagger-ui/index.html

Swagger can be used to:

* Explore available endpoints
* Inspect request and response structures
* Review API operations
* Test supported endpoints
* Understand the backend API design

Some endpoints require authentication and an appropriate JWT role.

---

# 🧪 Automated Testing

The backend includes automated **service-layer unit tests using JUnit 5 and Mockito**.

The tests focus on business logic within the service layer while mocking repository and security-related dependencies.

### Testing Approach

* **JUnit 5** for test execution and assertions
* **Mockito** for mocking dependencies
* **MockitoExtension** for test configuration
* Repository dependencies mocked at the service layer
* Password encoding and JWT dependencies mocked where required
* Exception scenarios tested using `assertThrows`
* Successful service operations verified with assertions and Mockito interaction verification

### Current Service Tests

The project currently includes unit tests for:

* `AdminService`
* `AuthService`
* `CourseService`
* `DashboardService`
* `DepartmentService`
* `ProfessorService`
* `StudentService`
* `Student_ProfileService`

### Test Execution

Tests can be executed with Maven:

**Windows:**

```powershell
.\mvnw clean test
```

**macOS / Linux:**

```bash
./mvnw clean test
```

The service-layer test suite currently executes successfully with **21 tests passing and no failures or errors**.

Testing can be expanded in future development to include integration, controller, repository, security, and end-to-end testing.

---

# 🔄 Example Authentication Flow

```text
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       │ Login credentials
       ▼
┌──────────────────────┐
│ Spring Boot Security │
└──────────┬───────────┘
           │
           │ Validate credentials
           ▼
┌──────────────────────┐
│      User / DB       │
└──────────┬───────────┘
           │
           │ Valid
           ▼
┌──────────────────────┐
│      JWT Token       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    React Frontend    │
└──────────┬───────────┘
           │
           │ Bearer JWT
           ▼
┌──────────────────────┐
│ Protected REST API   │
└──────────────────────┘
```

---

# 📁 Project Structure

```text
Student_Info_Management_System/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── auth/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── SIMS/
│   │   │           └── Student_Info_Management_System/
│   │   │               ├── controller/
│   │   │               ├── service/
│   │   │               ├── repository/
│   │   │               ├── entity/
│   │   │               ├── dto/
│   │   │               ├── security/
│   │   │               └── ...
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── SIMS/
│                   └── Student_Info_Management_System/
│                       └── Service/
│                           ├── AdminServiceTest.java
│                           ├── AuthServiceTest.java
│                           ├── CourseServiceTest.java
│                           ├── DashboardServiceTest.java
│                           ├── DepartmentServiceTest.java
│                           ├── ProfessorServiceTest.java
│                           ├── StudentServiceTest.java
│                           └── Student_ProfileServiceTest.java
│
├── .gitignore
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

---

# 💻 Running Locally

## Prerequisites

Make sure the following are installed:

* Java 17
* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Shikha144/Student_Info_Management_System.git
cd Student_Info_Management_System
```

---

## 2. Configure PostgreSQL

Create a local PostgreSQL database for the application.

Example database name:

```text
Student_Info_Management_System_db
```

Configure your local database connection in the appropriate Spring Boot configuration.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/Student_Info_Management_System_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

> **Security:** Never commit real database passwords, JWT secrets, API keys, or production environment variables to GitHub.

---

## 3. Run the Backend

From the project root:

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### macOS / Linux

```bash
./mvnw spring-boot:run
```

The backend will normally be available at:

```text
http://localhost:8080
```

Local Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal.

---

# 🧪 Testing & API Development

The application can be tested and explored using:

* **JUnit 5**
* **Mockito**
* **Maven**
* Swagger UI
* Postman
* Browser/API clients

The REST API uses JSON request and response bodies.

Authenticated requests use JWT bearer authentication:

```text
Authorization: Bearer <JWT>
```

The current automated testing implementation focuses on **service-layer unit testing**. Additional integration, controller, repository, security, and end-to-end tests can be added as the project evolves.

---

# 🚀 Deployment

The application is currently deployed using **Render**.

### Frontend

https://student-info-management-system-frontend.onrender.com

### Backend

https://student-info-management-system-g7v0.onrender.com

### Swagger

https://student-info-management-system-g7v0.onrender.com/swagger-ui/index.html

The production frontend communicates with the deployed Spring Boot backend through the configured production API URL.

---

# 🔮 Future Improvements

The current application provides the core full-stack functionality. Planned enhancements include expanding the system toward a more scalable, testable, and production-oriented architecture.

### 🧩 Microservices Architecture

* Evaluate decomposing major application domains into independently deployable services.
* Separate areas such as authentication, students, courses, and enrollments where appropriate.
* Introduce service-to-service communication.
* Explore centralized configuration and service discovery.

### ☸️ Kubernetes

* Containerize application services.
* Deploy containerized services using Kubernetes.
* Explore Kubernetes deployments, services, configuration, and scaling.
* Introduce health checks and resource management.

### 🧪 Automated Testing

Expand testing coverage with:

* Additional unit tests
* Integration tests
* Repository tests
* REST API tests
* Security and authorization tests
* End-to-end frontend testing

### 🔄 CI/CD

Introduce an automated CI/CD pipeline for:

```text
Code Push
   ↓
Build
   ↓
Automated Tests
   ↓
Application Packaging
   ↓
Deployment
```

### 📊 Monitoring & Observability

* Application health monitoring
* Centralized logging
* Error tracking
* Performance monitoring
* API metrics

### ⚡ Performance & Scalability

* Database query optimization
* Pagination and filtering
* Caching
* Improved API response handling
* Scalability improvements

### 🔎 Advanced Search

Expand management functionality with:

* Advanced search
* Filtering
* Sorting
* Pagination
* Multi-criteria queries

### 📈 Reporting & Analytics

Potential additions include:

* Enrollment reports
* Course statistics
* Department-level reports
* Student academic summaries
* Administrative dashboards

### 🎓 Additional Academic Features

Future versions may include:

* Attendance management
* Assignments
* Notifications
* Transcripts
* Expanded course management
* Academic reporting

### ♿ Accessibility & UI Improvements

Continue improving:

* Responsive design
* Keyboard navigation
* Form accessibility
* Semantic HTML
* User feedback and error states
* Overall usability

---

# 📚 Learning & Development Roadmap

The project is also being used as a practical progression from a traditional full-stack application toward more advanced software engineering practices:

```text
Current
   │
   ├── React
   ├── Spring Boot
   ├── REST APIs
   ├── PostgreSQL
   ├── Spring Security
   ├── JWT / RBAC
   ├── JUnit 5 / Mockito
   └── Render Deployment
        │
        ▼
Next
   │
   ├── Integration Testing
   ├── CI/CD
   ├── Docker
   ├── Monitoring
   └── Advanced API Design
        │
        ▼
Future
   │
   ├── Microservices
   ├── Kubernetes
   ├── Service Communication
   └── Cloud-Native Architecture
```

---

# 👩‍💻 Author

**Shikha Sharma**

GitHub: `Shikha144`

---

# 📌 Project Summary

**Student Information Management System** is a full-stack portfolio application demonstrating practical implementation of:

* React frontend development
* Spring Boot backend development
* RESTful API design
* PostgreSQL database integration
* JPA/Hibernate
* Spring Security
* JWT authentication
* BCrypt password hashing
* Role-Based Access Control
* JUnit 5 and Mockito service-layer testing
* Swagger/OpenAPI
* Git/GitHub
* Cloud deployment with Render

The project will continue to evolve with additional integration testing, CI/CD, containerization, microservices, Kubernetes, monitoring, and academic management features.
