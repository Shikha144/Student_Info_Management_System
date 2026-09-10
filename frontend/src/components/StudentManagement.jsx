import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getToken, getRole, logout } from "../auth";
import { API_URL } from "../services/api";
function StudentManagement() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [sort, setSort] = useState("lastName");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [deletingId, setDeletingId] = useState(null);

    // ============================================================
    // LOAD STUDENTS
    // ============================================================

    useEffect(() => {
        loadStudents();
    }, [page, sort]);

    const loadStudents = async () => {
        const token = getToken();
        const role = getRole();

        console.log("Student Management token:", !!token);
        console.log("Student Management role:", role);

        if (!token) {
            logout();
            navigate("/login");
            return;
        }

        // Make sure only admin can access this page
        if (role !== "ROLE_ADMIN") {
            console.error("Unauthorized role:", role);
            setError("You are not authorized to manage students.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/student/AllStudents?page=${page}&size=${size}&sort=${sort}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Student Management API status:",
                response.status
            );

            // ========================================================
            // AUTHORIZATION
            // ========================================================

            if (response.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            if (response.status === 403) {
                setError(
                    "You do not have permission to manage students."
                );
                return;
            }

            // ========================================================
            // SERVER ERROR
            // ========================================================

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText ||
                    `Server error: ${response.status}`
                );
            }

            // ========================================================
            // JSON RESPONSE
            // ========================================================

            const data = await response.json();

            console.log(
                "Student Management API data:",
                data
            );

            setStudents(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);

        } catch (error) {
            console.error(
                "Error loading students:",
                error
            );

            setError(
                error.message ||
                "Unable to load student data."
            );
        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // DELETE STUDENT
    // ============================================================

    const handleDelete = async (student) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
        );

        if (!confirmed) {
            return;
        }

        const token = getToken();

        if (!token) {
            logout();
            navigate("/login");
            return;
        }

        try {
            setDeletingId(student.student_id);
            setError("");
            setMessage("");

            console.log(
                "Deleting student:",
                student.student_id
            );

            const response = await fetch(
                `${API_URL}/student/delete/${student.student_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "text/plain, application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Delete student status:",
                response.status
            );

            // ========================================================
            // AUTHENTICATION
            // ========================================================

            if (response.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            // ========================================================
            // AUTHORIZATION
            // ========================================================

            if (response.status === 403) {
                throw new Error(
                    "You do not have permission to delete students."
                );
            }

            // ========================================================
            // READ RESPONSE CORRECTLY
            //
            // Spring Boot DELETE endpoint returns plain text:
            //
            // Student with id 5 deleted successfully
            //
            // Therefore DO NOT always call response.json().
            // ========================================================

            const contentType =
                response.headers.get("content-type") || "";

            let responseData;

            if (
                contentType.includes(
                    "application/json"
                )
            ) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // ========================================================
            // SERVER ERROR
            // ========================================================

            if (!response.ok) {

                let errorMessage;

                if (typeof responseData === "string") {
                    errorMessage = responseData;
                } else {
                    errorMessage =
                        responseData?.message ||
                        responseData?.error ||
                        "Failed to delete student.";
                }

                throw new Error(errorMessage);
            }

            console.log(
                "Delete student response:",
                responseData
            );

            // ========================================================
            // SUCCESS
            // ========================================================

            setMessage(
                typeof responseData === "string" &&
                responseData.trim()
                    ? responseData
                    : "Student deleted successfully."
            );

            setError("");

            // Reload current page
            await loadStudents();

        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );

            setError(
                error.message ||
                "Failed to delete student."
            );

            setMessage("");

        } finally {
            setDeletingId(null);
        }
    };


    // ============================================================
    // EDIT STUDENT
    // ============================================================

    const handleEdit = (student) => {

        console.log(
            "Editing student:",
            student
        );

        /*
         * Change this route if your project uses a different
         * student edit route.
         *
         * Example:
         * /admin/student/edit/5
         */

        navigate(
            `/admin/student/edit/${student.student_id}`,
            {
                state: {
                    student: student,
                },
            }
        );
    };


    // ============================================================
    // PAGINATION
    // ============================================================

    const handlePrevious = () => {

        if (page > 0) {
            setPage(page - 1);
        }
    };


    const handleNext = () => {

        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };


    // ============================================================
    // SORT
    // ============================================================

    const handleSortChange = (event) => {

        setSort(event.target.value);
        setPage(0);
    };


    // ============================================================
    // BACK TO ADMIN DASHBOARD
    // ============================================================

    const handleBack = () => {
        navigate("/admin-dashboard");
    };


    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {

        logout();
        navigate("/login");
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="dashboard-loading">

                <div className="loading-card">

                    <h2>
                        Loading Student Management...
                    </h2>

                    <p>
                        Please wait.
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="admin-dashboard">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="professor-header">

                <div>

                    <h1>
                        Student Management
                    </h1>

                    <p>
                        View and manage students in the system
                    </p>

                </div>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            {/* ====================================================
                MAIN SECTION
            ==================================================== */}

            <section className="dashboard-section">


                {/* ==================================================
                    SECTION HEADING
                ================================================== */}

                <div className="section-heading">

                    <div>

                        <h2>
                            All Students
                        </h2>

                        <p>
                            Total students:{" "}
                            <strong>
                                {totalElements}
                            </strong>
                        </p>

                    </div>


                    <div>

                        <label htmlFor="sort">
                            Sort by:{" "}
                        </label>

                        <select
                            id="sort"
                            value={sort}
                            onChange={handleSortChange}
                        >

                            <option value="lastName">
                                Last Name
                            </option>

                            <option value="firstName">
                                First Name
                            </option>

                            <option value="student_id">
                                Student ID
                            </option>

                            <option value="email">
                                Email
                            </option>

                        </select>

                    </div>

                </div>


                {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {message && (

                    <div
                        className="dashboard-success"
                        style={{
                            padding: "12px",
                            marginBottom: "15px",
                            borderRadius: "6px",
                        }}
                    >

                        <p>
                            {message}
                        </p>

                    </div>

                )}


                {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (

                    <div className="dashboard-error">

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadStudents}
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!error &&
                students.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🎓
                        </div>

                        <h3>
                            No students found
                        </h3>

                        <p>
                            There are currently no students
                            available.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       STUDENT TABLE
                    ================================================= */

                    <div className="student-table-container">

                        <table className="student-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        First Name
                                    </th>

                                    <th>
                                        Last Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.student_id
                                            }
                                        >

                                            <td>
                                                {student.student_id}
                                            </td>


                                            <td>
                                                {student.firstName}
                                            </td>


                                            <td>
                                                {student.lastName}
                                            </td>


                                            <td>
                                                {student.email}
                                            </td>


                                            <td>

                                                <span
                                                    className="role-badge"
                                                >
                                                    {student.role}
                                                </span>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            student
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId !==
                                                        null
                                                    }
                                                    style={{
                                                        marginRight:
                                                            "8px",
                                                        cursor:
                                                            "pointer",
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            student
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        student.student_id
                                                    }
                                                    style={{
                                                        cursor:
                                                            "pointer",
                                                    }}
                                                >

                                                    {deletingId ===
                                                    student.student_id
                                                        ? "Deleting..."
                                                        : "🗑 Delete"}

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                <div className="pagination">

                    <button
                        onClick={handlePrevious}
                        disabled={
                            page === 0
                        }
                    >
                        ← Previous
                    </button>


                    <span>

                        Page{" "}

                        <strong>
                            {totalPages === 0
                                ? 0
                                : page + 1}
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {totalPages}
                        </strong>

                    </span>


                    <button
                        onClick={handleNext}
                        disabled={
                            page >=
                                totalPages - 1 ||
                            totalPages === 0
                        }
                    >
                        Next →
                    </button>

                </div>


                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <div
                    style={{
                        marginTop: "20px",
                    }}
                >

                    <button
                        className="logout-button"
                        onClick={handleBack}
                    >
                        ← Back to Admin Dashboard
                    </button>

                </div>

            </section>

        </div>
    );
}

export default StudentManagement;

