import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
    getToken,
    getRole,
    logout
} from "../auth";

function CourseManagement() {

    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [sort, setSort] = useState("course_name");
    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD COURSES
    // =========================
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {

        const token = getToken();
        const role = getRole();

        console.log("=== COURSE MANAGEMENT STARTED ===");
        console.log("Course Management token:", !!token);
        console.log("Course Management role:", role);

        if (!token) {
            logout();
            navigate("/login");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/courses/getCourses`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Course Management API status:",
                response.status
            );

            if (response.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            if (response.status === 403) {
                setError(
                    "You do not have permission to access course data."
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    `Server error: ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Course Management API data:",
                data
            );

            setCourses(data || []);

        } catch (error) {

            console.error(
                "Error loading courses:",
                error
            );

            setError(
                "Unable to load course data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // SORT COURSES
    // =========================
    const sortedCourses = [...courses].sort((a, b) => {

        const valueA = a[sort];
        const valueB = b[sort];

        if (typeof valueA === "number" &&
            typeof valueB === "number") {

            return valueA - valueB;
        }

        return String(valueA ?? "")
            .toLowerCase()
            .localeCompare(
                String(valueB ?? "").toLowerCase()
            );
    });


    // =========================
    // PAGINATION
    // =========================
    const totalElements = courses.length;

    const totalPages = Math.ceil(
        totalElements / size
    );

    const startIndex = page * size;

    const currentCourses = sortedCourses.slice(
        startIndex,
        startIndex + size
    );


    // =========================
    // SORT CHANGE
    // =========================
    const handleSortChange = (event) => {

        setSort(event.target.value);
        setPage(0);

    };


    // =========================
    // PAGE CHANGE
    // =========================
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


    // =========================
    // LOADING
    // =========================
    if (loading) {

        return (
            <div className="admin-dashboard">

                <div className="professor-header">
                    <div>
                        <h1>Course Management</h1>
                        <p>
                            Manage courses, credits and course assignments.
                        </p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div className="dashboard-loading">
                    <div className="loading-card">
                        Loading courses...
                    </div>
                </div>

            </div>
        );
    }


    // =========================
    // ERROR
    // =========================
    if (error) {

        return (
            <div className="admin-dashboard">

                <div className="professor-header">

                    <div>
                        <h1>Course Management</h1>
                        <p>
                            Manage courses, credits and course assignments.
                        </p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>

                </div>

                <div className="dashboard-error">
                    <h3>Unable to Load Courses</h3>
                    <p>{error}</p>

                    <button
                        className="dashboard-button"
                        onClick={loadCourses}
                    >
                        Try Again
                    </button>
                </div>

            </div>
        );
    }


    // =========================
    // MAIN PAGE
    // =========================
    return (

        <div className="admin-dashboard">

            {/* HEADER */}
            <div className="professor-header">

                <div>
                    <h1>Course Management</h1>

                    <p>
                        Manage courses, credits and course assignments.
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                >
                    Logout
                </button>

            </div>


            {/* COURSE SECTION */}
            <section className="dashboard-section">

                <div className="section-heading">

                    <div>
                        <h2>All Courses</h2>

                        <p>
                            Total Courses: <strong>
                                {totalElements}
                            </strong>
                        </p>
                    </div>


                    {/* SORT */}
                    <div>

                        <label htmlFor="course-sort">
                            Sort by:
                        </label>

                        <select
                            id="course-sort"
                            value={sort}
                            onChange={handleSortChange}
                        >

                            <option value="course_name">
                                Course Name
                            </option>

                            <option value="course_id">
                                Course ID
                            </option>

                            <option value="credits">
                                Credits
                            </option>

                        </select>

                    </div>

                </div>


                {/* NO COURSES */}
                {courses.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>No Courses Found</h3>

                        <p>
                            There are currently no courses
                            available in the system.
                        </p>

                    </div>

                ) : (

                    <div className="professor-list">

                        {currentCourses.map((course) => (

                            <div
                                className="dashboard-card"
                                key={course.course_id}
                            >

                                {/* COURSE HEADER */}
                                <div className="card-header">

                                    <div>

                                        <h3>
                                            {course.course_name}
                                        </h3>

                                        <span className="role-badge">
                                            COURSE
                                        </span>

                                    </div>

                                </div>


                                {/* COURSE INFORMATION */}
                                <div className="card-content">

                                    <div>
                                        <strong>
                                            Course ID:
                                        </strong>

                                        <span>
                                            {course.course_id}
                                        </span>
                                    </div>


                                    <div>
                                        <strong>
                                            Course Name:
                                        </strong>

                                        <span>
                                            {course.course_name}
                                        </span>
                                    </div>


                                    <div>
                                        <strong>
                                            Credits:
                                        </strong>

                                        <span>
                                            {course.credits}
                                        </span>
                                    </div>

                                </div>


                                {/* COURSE ASSIGNMENT */}
                                <div className="course-section">

                                    <h4>
                                        Course Assignment
                                    </h4>

                                    <p>
                                        Professor assignment is managed
                                        through the course-professor
                                        relationship in the backend.
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* PAGINATION */}
                {totalPages > 1 && (

                    <div className="pagination">

                        <button
                            onClick={handlePrevious}
                            disabled={page === 0}
                        >
                            ← Previous
                        </button>


                        <span>
                            Page {page + 1} of {totalPages}
                        </span>


                        <button
                            onClick={handleNext}
                            disabled={
                                page === totalPages - 1
                            }
                        >
                            Next →
                        </button>

                    </div>

                )}

            </section>


            {/* BACK BUTTON */}
            <div className="dashboard-section">

                <button
                    className="dashboard-button"
                    onClick={() =>
                        navigate("/admin-dashboard")
                    }
                >
                    ← Back to Admin Dashboard
                </button>

            </div>

        </div>
    );
}

export default CourseManagement;