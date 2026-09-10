import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../services/api";
import {
    getToken,
    getRole,
    logout
} from "../auth";

function ProfessorDashboard() {

    const navigate = useNavigate();

    const [professor, setProfessor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [savingGrade, setSavingGrade] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("ALL");
    const [selectedGrade, setSelectedGrade] = useState("ALL");

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    useEffect(() => {
        getProfessorData();
    }, []);

    // =====================================================
    // GET PROFESSOR DASHBOARD
    // =====================================================

    const getProfessorData = async () => {

        const token = getToken();
        const role = getRole();

        console.log("=== PROFESSOR DASHBOARD ===");
        console.log("Token exists:", !!token);
        console.log("Role:", role);

        if (!token) {
            logout();
            navigate("/login");
            return;
        }

        if (role !== "ROLE_PROFESSOR") {
            logout();
            navigate("/login");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/professor/me`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Professor dashboard status:",
                response.status
            );

            if (response.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            if (response.status === 403) {
                setError(
                    "You do not have permission to access the professor dashboard."
                );
                return;
            }

            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    errorText ||
                    `Server error: ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Professor dashboard data:",
                data
            );

            setProfessor({
                ...data,
                courses:
                    Array.isArray(data.courses)
                        ? data.courses
                        : []
            });

        } catch (err) {

            console.error(
                "Professor dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load professor dashboard."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {
        getProfessorData();
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // =====================================================
    // UPDATE GRADE
    // =====================================================

    const updateGrade = async (
        enrollmentId,
        grade
    ) => {

        if (!grade) {

            setError(
                "Please select a grade."
            );

            return;
        }

        const token = getToken();

        try {

            setSavingGrade(enrollmentId);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/professor/enrollments/${enrollmentId}/grade`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        grade: grade
                    })
                }
            );

            console.log(
                "Grade update status:",
                response.status
            );

            if (response.status === 401) {

                logout();
                navigate("/login");

                return;
            }

            if (response.status === 403) {

                setError(
                    "You are not authorized to update this student's grade."
                );

                return;
            }

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Server error: ${response.status}`
                );
            }

            const updatedEnrollment =
                await response.json();

            setProfessor(
                (currentProfessor) => {

                    if (!currentProfessor) {
                        return currentProfessor;
                    }

                    return {
                        ...currentProfessor,

                        courses:
                            currentProfessor.courses.map(
                                (course) => ({

                                    ...course,

                                    enrollments:
                                        course.enrollments.map(
                                            (enrollment) => {

                                                if (
                                                    enrollment.enrollment_id ===
                                                    enrollmentId
                                                ) {

                                                    return {
                                                        ...enrollment,

                                                        grade:
                                                            updatedEnrollment.grade
                                                    };
                                                }

                                                return enrollment;
                                            }
                                        )
                                })
                            )
                    };
                }
            );

            setMessage(
                "Grade updated successfully."
            );

        } catch (err) {

            console.error(
                "Grade update error:",
                err
            );

            setError(
                err.message ||
                "Unable to update grade."
            );

        } finally {

            setSavingGrade(null);
        }
    };

    // =====================================================
    // COURSE LIST
    // =====================================================

    const courses =
        professor?.courses || [];

    // =====================================================
    // TOTAL STUDENTS
    // =====================================================

    const totalStudents =
        courses.reduce(
            (total, course) => {

                const enrollments =
                    Array.isArray(
                        course.enrollments
                    )
                        ? course.enrollments
                        : [];

                return total +
                    enrollments.length;
            },
            0
        );

    // =====================================================
    // PENDING GRADES
    // =====================================================

    const pendingGrades =
        courses.reduce(
            (total, course) => {

                const enrollments =
                    Array.isArray(
                        course.enrollments
                    )
                        ? course.enrollments
                        : [];

                return total +
                    enrollments.filter(
                        enrollment =>
                            !enrollment.grade
                    ).length;

            },
            0
        );

    // =====================================================
    // FILTERED COURSES
    // =====================================================

    const filteredCourses =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            return courses
                .filter((course) => {

                    if (
                        selectedCourse !== "ALL" &&
                        String(course.course_id) !==
                        String(selectedCourse)
                    ) {
                        return false;
                    }

                    return true;
                })
                .map((course) => {

                    const enrollments =
                        Array.isArray(
                            course.enrollments
                        )
                            ? course.enrollments
                            : [];

                    const filteredEnrollments =
                        enrollments.filter(
                            (enrollment) => {

                                const studentName =
                                    [
                                        enrollment.student_first_name,
                                        enrollment.student_last_name
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                                        .toLowerCase();

                                const email =
                                    (
                                        enrollment.student_email ||
                                        ""
                                    ).toLowerCase();

                                const studentId =
                                    String(
                                        enrollment.student_id ?? ""
                                    );

                                const searchMatches =
                                    !search ||
                                    studentName.includes(search) ||
                                    email.includes(search) ||
                                    studentId.includes(search);

                                const gradeMatches =
                                    selectedGrade === "ALL" ||
                                    (
                                        selectedGrade === "NOT_GRADED"
                                            ? !enrollment.grade
                                            : enrollment.grade === selectedGrade
                                    );

                                return (
                                    searchMatches &&
                                    gradeMatches
                                );
                            }
                        );

                    return {
                        ...course,
                        filteredEnrollments
                    };

                })
                .filter(course =>
                    course.filteredEnrollments.length > 0 ||
                    (
                        !search &&
                        selectedGrade === "ALL"
                    )
                );

        }, [
            courses,
            searchTerm,
            selectedCourse,
            selectedGrade
        ]);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <>
                <style>{styles}</style>

                <div className="professor-page loading-page">

                    <div className="loading-box">

                        <div className="spinner"></div>

                        <h2>
                            Loading Dashboard
                        </h2>

                        <p>
                            Please wait while we load your information.
                        </p>

                    </div>

                </div>
            </>
        );
    }

    // =====================================================
    // ERROR WITH NO DATA
    // =====================================================

    if (error && !professor) {

        return (
            <>
                <style>{styles}</style>

                <div className="professor-page error-page">

                    <div className="error-box">

                        <div className="error-icon">
                            !
                        </div>

                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
                        </p>

                        <div className="error-actions">

                            <button
                                className="primary-btn"
                                onClick={handleRefresh}
                            >
                                Try Again
                            </button>

                            <button
                                className="secondary-btn"
                                onClick={handleLogout}
                            >
                                Back to Login
                            </button>

                        </div>

                    </div>

                </div>
            </>
        );
    }

    if (!professor) {

        return (
            <>
                <style>{styles}</style>

                <div className="professor-page error-page">

                    <div className="error-box">

                        <div className="error-icon">
                            !
                        </div>

                        <h2>
                            No Professor Data
                        </h2>

                        <p>
                            No professor information was returned.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={handleLogout}
                        >
                            Back to Login
                        </button>

                    </div>

                </div>
            </>
        );
    }

    // =====================================================
    // MAIN DASHBOARD
    // =====================================================

    return (

        <>
            <style>{styles}</style>

            <div className="professor-page">

                {/* =================================================
                    TOP NAVIGATION
                ================================================= */}

                <header className="top-navbar">

                    <div className="brand">

                        <div className="brand-icon">
                            🎓
                        </div>

                        <div>
                            <div className="brand-title">
                                Professor Portal
                            </div>

                            <div className="brand-subtitle">
                                Student Information System
                            </div>
                        </div>

                    </div>

                    <div className="nav-actions">

                        <button
                            className="nav-btn refresh-btn"
                            onClick={handleRefresh}
                        >
                            ↻
                            <span>Refresh</span>
                        </button>

                        <button
                            className="nav-btn logout-btn"
                            onClick={handleLogout}
                        >
                            ⇥
                            <span>Logout</span>
                        </button>

                    </div>

                </header>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <main className="dashboard-container">

                    {/* HERO */}

                    <section className="hero-section">

                        <div>

                            <div className="welcome-label">
                                PROFESSOR DASHBOARD
                            </div>

                            <h1>
                                Welcome back,{" "}
                                <span>
                                    {professor.professor_name}
                                </span>
                            </h1>

                            <p>
                                Manage your courses, monitor student
                                enrollments, and update grades from one place.
                            </p>

                        </div>

                        <div className="professor-avatar">

                            {professor.professor_name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}

                        </div>

                    </section>


                    {/* ALERTS */}

                    {message && (

                        <div className="success-alert">

                            <div className="alert-symbol">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Success
                                </strong>

                                <span>
                                    {message}
                                </span>
                            </div>

                        </div>

                    )}


                    {error && (

                        <div className="danger-alert">

                            <div className="alert-symbol">
                                !
                            </div>

                            <div>
                                <strong>
                                    Attention
                                </strong>

                                <span>
                                    {error}
                                </span>
                            </div>

                        </div>

                    )}


                    {/* =================================================
                        PROFESSOR INFORMATION
                    ================================================= */}

                    <section className="section">

                        <div className="section-title">

                            <div>
                                <h2>
                                    Professor Information
                                </h2>

                                <p>
                                    Your account and academic profile
                                </p>
                            </div>

                        </div>

                        <div className="profile-grid">

                            <div className="profile-card">

                                <div className="profile-card-icon">
                                    ID
                                </div>

                                <div>
                                    <span>
                                        Professor ID
                                    </span>

                                    <strong>
                                        {professor.professor_id}
                                    </strong>
                                </div>

                            </div>


                            <div className="profile-card">

                                <div className="profile-card-icon">
                                    @
                                </div>

                                <div>
                                    <span>
                                        Email Address
                                    </span>

                                    <strong className="email-text">
                                        {professor.email}
                                    </strong>
                                </div>

                            </div>


                            <div className="profile-card">

                                <div className="profile-card-icon">
                                    ✓
                                </div>

                                <div>
                                    <span>
                                        Account Role
                                    </span>

                                    <strong>
                                        {professor.role}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <section className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-icon course-icon">
                                📚
                            </div>

                            <div className="stat-content">

                                <span>
                                    My Courses
                                </span>

                                <strong>
                                    {courses.length}
                                </strong>

                                <small>
                                    Assigned courses
                                </small>

                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-icon student-icon">
                                👥
                            </div>

                            <div className="stat-content">

                                <span>
                                    Total Students
                                </span>

                                <strong>
                                    {totalStudents}
                                </strong>

                                <small>
                                    Active enrollments
                                </small>

                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-icon grade-icon">
                                ✓
                            </div>

                            <div className="stat-content">

                                <span>
                                    Pending Grades
                                </span>

                                <strong>
                                    {pendingGrades}
                                </strong>

                                <small>
                                    Grades awaiting entry
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <section className="filter-panel">

                        <div className="filter-header">

                            <div>

                                <h2>
                                    Student Search & Filters
                                </h2>

                                <p>
                                    Find students and filter enrollments quickly.
                                </p>

                            </div>

                            <button
                                className="reset-btn"
                                onClick={() => {

                                    setSearchTerm("");
                                    setSelectedCourse("ALL");
                                    setSelectedGrade("ALL");

                                }}
                            >
                                Reset Filters
                            </button>

                        </div>


                        <div className="filter-grid">

                            <div className="filter-field">

                                <label>
                                    Search Students
                                </label>

                                <div className="input-wrapper">

                                    <span>
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Name, email or student ID"
                                    />

                                </div>

                            </div>


                            <div className="filter-field">

                                <label>
                                    Course
                                </label>

                                <select
                                    value={selectedCourse}
                                    onChange={(event) =>
                                        setSelectedCourse(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="ALL">
                                        All Courses
                                    </option>

                                    {courses.map(
                                        (course) => (

                                            <option
                                                key={
                                                    course.course_id
                                                }
                                                value={
                                                    course.course_id
                                                }
                                            >
                                                {
                                                    course.course_name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="filter-field">

                                <label>
                                    Grade
                                </label>

                                <select
                                    value={selectedGrade}
                                    onChange={(event) =>
                                        setSelectedGrade(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="ALL">
                                        All Grades
                                    </option>

                                    <option value="NOT_GRADED">
                                        Not Graded
                                    </option>

                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="B-">B-</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="C-">C-</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="F">F</option>

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        COURSES
                    ================================================= */}

                    <section className="section courses-section">

                        <div className="section-title course-title">

                            <div>

                                <h2>
                                    My Courses
                                </h2>

                                <p>
                                    Courses assigned to you and their student enrollments.
                                </p>

                            </div>

                            <div className="course-count">
                                {courses.length}{" "}
                                {courses.length === 1
                                    ? "Course"
                                    : "Courses"}
                            </div>

                        </div>


                        {filteredCourses.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    🔍
                                </div>

                                <h3>
                                    No matching records
                                </h3>

                                <p>
                                    No courses or students match your current filters.
                                </p>

                                <button
                                    className="primary-btn"
                                    onClick={() => {

                                        setSearchTerm("");
                                        setSelectedCourse("ALL");
                                        setSelectedGrade("ALL");

                                    }}
                                >
                                    Clear Filters
                                </button>

                            </div>

                        ) : (

                            <div className="course-grid">

                                {filteredCourses.map(
                                    (course) => (

                                        <article
                                            key={
                                                course.course_id
                                            }
                                            className="course-card"
                                        >

                                            {/* COURSE HEADER */}

                                            <div className="course-card-header">

                                                <div>

                                                    <div className="course-number">
                                                        COURSE #{course.course_id}
                                                    </div>

                                                    <h3>
                                                        {course.course_name}
                                                    </h3>

                                                </div>

                                                <div className="course-symbol">
                                                    📖
                                                </div>

                                            </div>


                                            {/* COURSE STATS */}

                                            <div className="course-stats">

                                                <div>

                                                    <span>
                                                        Credits
                                                    </span>

                                                    <strong>
                                                        {course.credits}
                                                    </strong>

                                                </div>

                                                <div>

                                                    <span>
                                                        Students
                                                    </span>

                                                    <strong>
                                                        {
                                                            course.enrollments
                                                                ?.length ?? 0
                                                        }
                                                    </strong>

                                                </div>

                                                <div>

                                                    <span>
                                                        Pending
                                                    </span>

                                                    <strong>
                                                        {
                                                            (
                                                                course.enrollments ||
                                                                []
                                                            ).filter(
                                                                enrollment =>
                                                                    !enrollment.grade
                                                            ).length
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* STUDENT ROSTER */}

                                            <div className="roster">

                                                <div className="roster-header">

                                                    <div>

                                                        <h4>
                                                            Student Roster
                                                        </h4>

                                                        <span>
                                                            {
                                                                course.filteredEnrollments?.length ||
                                                                0
                                                            }{" "}
                                                            student
                                                            {
                                                                course.filteredEnrollments?.length === 1
                                                                    ? ""
                                                                    : "s"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>


                                                {
                                                    course.filteredEnrollments
                                                        ?.length === 0
                                                        ? (

                                                            <div className="no-students">

                                                                <span>
                                                                    🔍
                                                                </span>

                                                                <p>
                                                                    No students match the current filters.
                                                                </p>

                                                            </div>

                                                        )
                                                        : (

                                                            <div className="enrollment-list">

                                                                {
                                                                    course.filteredEnrollments
                                                                        ?.map(
                                                                            (
                                                                                enrollment
                                                                            ) => {

                                                                                const studentName =
                                                                                    [
                                                                                        enrollment.student_first_name,
                                                                                        enrollment.student_last_name
                                                                                    ]
                                                                                        .filter(Boolean)
                                                                                        .join(" ") ||
                                                                                    "Unknown Student";

                                                                                return (

                                                                                    <div
                                                                                        key={
                                                                                            enrollment.enrollment_id
                                                                                        }
                                                                                        className="student-row"
                                                                                    >

                                                                                        {/* STUDENT */}

                                                                                        <div className="student-main">

                                                                                            <div className="student-avatar">

                                                                                                {studentName
                                                                                                    .charAt(0)
                                                                                                    .toUpperCase()}

                                                                                            </div>

                                                                                            <div>

                                                                                                <strong>
                                                                                                    {studentName}
                                                                                                </strong>

                                                                                                <span>
                                                                                                    {
                                                                                                        enrollment.student_email ||
                                                                                                        "Email unavailable"
                                                                                                    }
                                                                                                </span>

                                                                                            </div>

                                                                                        </div>


                                                                                        {/* STUDENT ID */}

                                                                                        <div className="student-detail">

                                                                                            <label>
                                                                                                Student ID
                                                                                            </label>

                                                                                            <strong>
                                                                                                {
                                                                                                    enrollment.student_id ??
                                                                                                    "N/A"
                                                                                                }
                                                                                            </strong>

                                                                                        </div>


                                                                                        {/* ENROLLMENT ID */}

                                                                                        <div className="student-detail">

                                                                                            <label>
                                                                                                Enrollment
                                                                                            </label>

                                                                                            <strong>
                                                                                                #
                                                                                                {
                                                                                                    enrollment.enrollment_id
                                                                                                }
                                                                                            </strong>

                                                                                        </div>


                                                                                        {/* GRADE */}

                                                                                        <div className="grade-control">

                                                                                            <label>
                                                                                                Grade
                                                                                            </label>

                                                                                            <select
                                                                                                value={
                                                                                                    enrollment.grade ||
                                                                                                    ""
                                                                                                }
                                                                                                onChange={(
                                                                                                    event
                                                                                                ) => {

                                                                                                    const newGrade =
                                                                                                        event.target.value;

                                                                                                    if (
                                                                                                        newGrade
                                                                                                    ) {

                                                                                                        updateGrade(
                                                                                                            enrollment.enrollment_id,
                                                                                                            newGrade
                                                                                                        );
                                                                                                    }

                                                                                                }}
                                                                                                disabled={
                                                                                                    savingGrade ===
                                                                                                    enrollment.enrollment_id
                                                                                                }
                                                                                            >

                                                                                                <option value="">
                                                                                                    Select Grade
                                                                                                </option>

                                                                                                <option value="A+">A+</option>
                                                                                                <option value="A">A</option>
                                                                                                <option value="A-">A-</option>
                                                                                                <option value="B+">B+</option>
                                                                                                <option value="B">B</option>
                                                                                                <option value="B-">B-</option>
                                                                                                <option value="C+">C+</option>
                                                                                                <option value="C">C</option>
                                                                                                <option value="C-">C-</option>
                                                                                                <option value="D+">D+</option>
                                                                                                <option value="D">D</option>
                                                                                                <option value="F">F</option>

                                                                                            </select>

                                                                                            {savingGrade ===
                                                                                                enrollment.enrollment_id && (

                                                                                                <small>
                                                                                                    Saving...
                                                                                                </small>

                                                                                            )}

                                                                                        </div>


                                                                                        {/* STATUS */}

                                                                                        <div className="status-control">

                                                                                            <label>
                                                                                                Status
                                                                                            </label>

                                                                                            <span
                                                                                                className={
                                                                                                    enrollment.status ===
                                                                                                    "ACTIVE"
                                                                                                        ? "status-badge active"
                                                                                                        : "status-badge"
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    enrollment.status ||
                                                                                                    "N/A"
                                                                                                }
                                                                                            </span>

                                                                                        </div>


                                                                                        {/* DATE */}

                                                                                        <div className="date-control">

                                                                                            <label>
                                                                                                Enrollment Date
                                                                                            </label>

                                                                                            <strong>
                                                                                                {
                                                                                                    enrollment.enrollment_date ||
                                                                                                    "N/A"
                                                                                                }
                                                                                            </strong>

                                                                                        </div>

                                                                                    </div>

                                                                                );
                                                                            }
                                                                        )
                                                                }

                                                            </div>
                                                        )
                                                }

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </main>


                {/* FOOTER */}

                <footer className="dashboard-footer">

                    <span>
                        Student Information Management System
                    </span>

                    <span>
                        Professor Portal
                    </span>

                </footer>

            </div>
        </>
    );
}


// =====================================================
// COMPLETE UI STYLES
// =====================================================

const styles = `

* {
    box-sizing: border-box;
}

.professor-page {
    min-height: 100vh;
    background: #f5f7fb;
    color: #172033;
    font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}

/* ==========================================
   TOP NAVBAR
========================================== */

.top-navbar {
    height: 76px;
    background: #ffffff;
    border-bottom: 1px solid #e6eaf0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px;
    position: sticky;
    top: 0;
    z-index: 100;
}

.brand {
    display: flex;
    align-items: center;
    gap: 13px;
}

.brand-icon {
    width: 43px;
    height: 43px;
    border-radius: 12px;
    background: #172554;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
}

.brand-title {
    font-size: 17px;
    font-weight: 750;
    color: #172033;
}

.brand-subtitle {
    font-size: 11px;
    color: #7b8495;
    margin-top: 2px;
}

.nav-actions {
    display: flex;
    gap: 10px;
}

.nav-btn {
    border: 1px solid #dfe4eb;
    background: #ffffff;
    border-radius: 9px;
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.2s ease;
}

.nav-btn:hover {
    background: #f5f7fb;
    transform: translateY(-1px);
}

.logout-btn {
    color: #b42318;
    border-color: #f0d3d0;
}

.refresh-btn {
    color: #344054;
}

/* ==========================================
   MAIN
========================================== */

.dashboard-container {
    width: min(1400px, calc(100% - 48px));
    margin: 0 auto;
    padding: 34px 0 50px;
}

/* ==========================================
   HERO
========================================== */

.hero-section {
    background: linear-gradient(
        135deg,
        #172554 0%,
        #1e3a8a 55%,
        #312e81 100%
    );
    border-radius: 18px;
    min-height: 190px;
    padding: 35px 40px;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    position: relative;
    box-shadow: 0 12px 30px rgba(23, 37, 84, 0.15);
}

.hero-section::after {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 45px solid rgba(255,255,255,0.05);
    right: -100px;
    top: -150px;
}

.welcome-label {
    font-size: 11px;
    letter-spacing: 1.5px;
    font-weight: 750;
    opacity: 0.72;
    margin-bottom: 10px;
}

.hero-section h1 {
    margin: 0;
    font-size: 32px;
    line-height: 1.2;
    font-weight: 760;
    position: relative;
    z-index: 2;
}

.hero-section h1 span {
    color: #c7d2fe;
}

.hero-section p {
    margin: 12px 0 0;
    max-width: 650px;
    color: #dbe4ff;
    font-size: 14px;
    line-height: 1.6;
    position: relative;
    z-index: 2;
}

.professor-avatar {
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background: rgba(255,255,255,0.14);
    border: 2px solid rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 31px;
    font-weight: 750;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
}

/* ==========================================
   ALERTS
========================================== */

.success-alert,
.danger-alert {
    margin-top: 22px;
    padding: 13px 16px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.success-alert {
    background: #ecfdf3;
    border: 1px solid #b7ebca;
    color: #067647;
}

.danger-alert {
    background: #fff1f0;
    border: 1px solid #f2c5c2;
    color: #b42318;
}

.alert-symbol {
    width: 29px;
    height: 29px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    background: rgba(255,255,255,0.65);
}

.success-alert strong,
.danger-alert strong {
    display: block;
    font-size: 13px;
}

.success-alert span,
.danger-alert span {
    display: block;
    font-size: 13px;
    margin-top: 2px;
}

/* ==========================================
   SECTIONS
========================================== */

.section {
    margin-top: 30px;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 15px;
}

.section-title h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 740;
    color: #172033;
}

.section-title p {
    margin: 5px 0 0;
    font-size: 13px;
    color: #7b8495;
}

/* ==========================================
   PROFILE
========================================== */

.profile-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.profile-card {
    background: #ffffff;
    border: 1px solid #e5e9f0;
    border-radius: 13px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 2px 8px rgba(16,24,40,0.025);
}

.profile-card-icon {
    width: 43px;
    height: 43px;
    border-radius: 10px;
    background: #eef2ff;
    color: #3730a3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
}

.profile-card span {
    display: block;
    font-size: 11px;
    color: #7b8495;
    margin-bottom: 5px;
}

.profile-card strong {
    display: block;
    font-size: 14px;
    color: #273044;
}

.email-text {
    word-break: break-word;
}

/* ==========================================
   STATISTICS
========================================== */

.stats-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 20px;
}

.stat-card {
    background: #ffffff;
    border: 1px solid #e5e9f0;
    border-radius: 14px;
    padding: 21px;
    display: flex;
    gap: 15px;
    align-items: center;
    box-shadow: 0 2px 8px rgba(16,24,40,0.025);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    flex-shrink: 0;
}

.course-icon {
    background: #eef2ff;
}

.student-icon {
    background: #eff8ff;
}

.grade-icon {
    background: #fff7ed;
}

.stat-content span {
    display: block;
    font-size: 12px;
    color: #7b8495;
}

.stat-content strong {
    display: block;
    font-size: 27px;
    line-height: 1.2;
    margin: 3px 0;
    color: #172033;
}

.stat-content small {
    font-size: 11px;
    color: #98a2b3;
}

/* ==========================================
   FILTERS
========================================== */

.filter-panel {
    background: #ffffff;
    border: 1px solid #e5e9f0;
    border-radius: 14px;
    margin-top: 30px;
    padding: 23px;
    box-shadow: 0 2px 8px rgba(16,24,40,0.025);
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.filter-header h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 720;
}

.filter-header p {
    margin: 5px 0 0;
    color: #7b8495;
    font-size: 12px;
}

.filter-grid {
    display: grid;
    grid-template-columns:
        1.5fr 1fr 1fr;
    gap: 15px;
}

.filter-field label {
    display: block;
    font-size: 12px;
    font-weight: 650;
    color: #344054;
    margin-bottom: 7px;
}

.filter-field input,
.filter-field select,
.grade-control select {
    width: 100%;
    height: 42px;
    border: 1px solid #d7dce4;
    background: #ffffff;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    color: #344054;
    outline: none;
    transition: all 0.2s ease;
}

.filter-field input:focus,
.filter-field select:focus,
.grade-control select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
}

.input-wrapper {
    position: relative;
}

.input-wrapper span {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
}

.input-wrapper input {
    padding-left: 38px;
}

.reset-btn {
    border: 1px solid #d7dce4;
    background: #ffffff;
    color: #475467;
    border-radius: 8px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
}

.reset-btn:hover {
    background: #f8fafc;
}

/* ==========================================
   COURSE SECTION
========================================== */

.courses-section {
    margin-top: 32px;
}

.course-title {
    align-items: center;
}

.course-count {
    background: #eef2ff;
    color: #3730a3;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 750;
}

.course-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.course-card {
    background: #ffffff;
    border: 1px solid #e1e6ed;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(16,24,40,0.035);
}

.course-card-header {
    padding: 22px 24px;
    background: #fafbff;
    border-bottom: 1px solid #e8ebf1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.course-number {
    font-size: 10px;
    letter-spacing: 1px;
    font-weight: 750;
    color: #6366f1;
    margin-bottom: 6px;
}

.course-card-header h3 {
    margin: 0;
    font-size: 21px;
    font-weight: 740;
    color: #172033;
    text-transform: capitalize;
}

.course-symbol {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
}

/* ==========================================
   COURSE STATS
========================================== */

.course-stats {
    display: grid;
    grid-template-columns:
        repeat(3, 1fr);
    border-bottom: 1px solid #e8ebf1;
}

.course-stats > div {
    padding: 15px 24px;
    border-right: 1px solid #e8ebf1;
}

.course-stats > div:last-child {
    border-right: none;
}

.course-stats span {
    display: block;
    font-size: 11px;
    color: #7b8495;
    margin-bottom: 4px;
}

.course-stats strong {
    font-size: 17px;
    color: #273044;
}

/* ==========================================
   ROSTER
========================================== */

.roster {
    padding: 20px 24px 24px;
}

.roster-header {
    margin-bottom: 13px;
}

.roster-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 720;
}

.roster-header span {
    font-size: 11px;
    color: #98a2b3;
}

.enrollment-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
}

.student-row {
    border: 1px solid #e8ebf0;
    border-radius: 11px;
    padding: 15px;
    display: grid;
    grid-template-columns:
        2fr
        0.8fr
        0.8fr
        1fr
        0.9fr
        1.1fr;
    gap: 15px;
    align-items: center;
    transition: all 0.2s ease;
}

.student-row:hover {
    border-color: #cfd5df;
    box-shadow: 0 3px 10px rgba(16,24,40,0.035);
}

.student-main {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
}

.student-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #eef2ff;
    color: #3730a3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 750;
    font-size: 14px;
    flex-shrink: 0;
}

.student-main strong {
    display: block;
    font-size: 13px;
    color: #273044;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.student-main span {
    display: block;
    font-size: 11px;
    color: #98a2b3;
    margin-top: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.student-detail label,
.grade-control label,
.status-control label,
.date-control label {
    display: block;
    font-size: 10px;
    color: #98a2b3;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: 700;
}

.student-detail strong,
.date-control strong {
    font-size: 12px;
    color: #344054;
}

.grade-control select {
    height: 36px;
    font-size: 12px;
    padding: 0 9px;
}

.grade-control small {
    display: block;
    font-size: 10px;
    color: #6366f1;
    margin-top: 3px;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 750;
    background: #f2f4f7;
    color: #667085;
}

.status-badge.active {
    background: #ecfdf3;
    color: #067647;
}

/* ==========================================
   EMPTY STATE
========================================== */

.empty-state {
    background: #ffffff;
    border: 1px dashed #d5dbe5;
    border-radius: 15px;
    padding: 60px 20px;
    text-align: center;
}

.empty-icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    background: #f2f4f7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    font-size: 23px;
}

.empty-state h3 {
    margin: 0;
    font-size: 16px;
}

.empty-state p {
    margin: 7px 0 17px;
    color: #98a2b3;
    font-size: 12px;
}

/* ==========================================
   BUTTONS
========================================== */

.primary-btn,
.secondary-btn {
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    border: none;
}

.primary-btn {
    background: #1e3a8a;
    color: #ffffff;
}

.primary-btn:hover {
    background: #172554;
}

.secondary-btn {
    background: #ffffff;
    color: #344054;
    border: 1px solid #d7dce4;
}

/* ==========================================
   NO STUDENTS
========================================== */

.no-students {
    border: 1px dashed #d8dde6;
    border-radius: 10px;
    padding: 28px;
    text-align: center;
    background: #fafbfc;
}

.no-students span {
    font-size: 20px;
}

.no-students p {
    margin: 7px 0 0;
    font-size: 12px;
    color: #98a2b3;
}

/* ==========================================
   FOOTER
========================================== */

.dashboard-footer {
    border-top: 1px solid #e5e9f0;
    background: #ffffff;
    padding: 19px 42px;
    display: flex;
    justify-content: space-between;
    color: #98a2b3;
    font-size: 11px;
}

/* ==========================================
   LOADING
========================================== */

.loading-page,
.error-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: #f5f7fb;
}

.loading-box,
.error-box {
    width: min(430px, 100%);
    background: #ffffff;
    border: 1px solid #e4e8ef;
    border-radius: 15px;
    padding: 35px;
    text-align: center;
    box-shadow: 0 8px 30px rgba(16,24,40,0.06);
}

.loading-box h2,
.error-box h2 {
    margin: 17px 0 7px;
    font-size: 20px;
}

.loading-box p,
.error-box p {
    margin: 0;
    color: #7b8495;
    font-size: 13px;
    line-height: 1.5;
}

.spinner {
    width: 38px;
    height: 38px;
    border: 4px solid #e4e7ec;
    border-top-color: #3730a3;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: auto;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fff1f0;
    color: #b42318;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 21px;
    margin: auto;
}

.error-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 22px;
}

/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 1100px) {

    .student-row {
        grid-template-columns:
            1.7fr
            0.8fr
            0.8fr
            1fr;
    }

    .status-control,
    .date-control {
        grid-column: span 2;
    }
}

@media (max-width: 850px) {

    .top-navbar {
        padding: 0 20px;
    }

    .dashboard-container {
        width: min(100% - 30px, 1400px);
    }

    .profile-grid,
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .filter-grid {
        grid-template-columns: 1fr;
    }

    .hero-section {
        padding: 28px;
    }

    .hero-section h1 {
        font-size: 26px;
    }

    .student-row {
        grid-template-columns: 1fr 1fr;
    }

    .student-main {
        grid-column: span 2;
    }

    .date-control {
        grid-column: span 2;
    }

}

@media (max-width: 600px) {

    .top-navbar {
        height: auto;
        min-height: 70px;
        padding: 13px 15px;
        gap: 10px;
    }

    .brand-subtitle {
        display: none;
    }

    .brand-title {
        font-size: 14px;
    }

    .brand-icon {
        width: 38px;
        height: 38px;
    }

    .nav-btn span {
        display: none;
    }

    .nav-btn {
        width: 39px;
        height: 39px;
        justify-content: center;
        padding: 0;
    }

    .dashboard-container {
        width: calc(100% - 20px);
        padding-top: 15px;
    }

    .hero-section {
        min-height: 180px;
        padding: 25px;
        border-radius: 14px;
    }

    .hero-section h1 {
        font-size: 23px;
    }

    .hero-section p {
        font-size: 12px;
    }

    .professor-avatar {
        width: 58px;
        height: 58px;
        font-size: 22px;
    }

    .filter-panel,
    .roster {
        padding: 17px;
    }

    .filter-header {
        align-items: flex-start;
        gap: 10px;
    }

    .course-card-header {
        padding: 18px;
    }

    .course-stats > div {
        padding: 13px 17px;
    }

    .student-row {
        grid-template-columns: 1fr;
    }

    .student-main,
    .date-control,
    .status-control {
        grid-column: auto;
    }

    .dashboard-footer {
        padding: 18px 15px;
        flex-direction: column;
        gap: 6px;
    }

    .error-actions {
        flex-direction: column;
    }

}

`;

export default ProfessorDashboard;