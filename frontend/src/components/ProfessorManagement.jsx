import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../services/api";
import {
    getToken,
    getRole,
    logout
} from "../auth";


function ProfessorManagement() {

    const navigate = useNavigate();

    const [professors, setProfessors] =
        useState([]);

    const [sort, setSort] =
        useState("professor_name");

    const [page, setPage] =
        useState(0);

    const [size] =
        useState(5);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");


    // =====================================================
    // LOAD PROFESSORS
    // =====================================================

    useEffect(() => {

        loadProfessors();

    }, []);


    const loadProfessors = async () => {

        const token = getToken();

        if (!token) {

            logout();

            navigate("/login");

            return;
        }


        try {

            setLoading(true);
            setError("");


            const response = await fetch(
               `${API_URL}/professor/getData`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            if (response.status === 401) {

                logout();

                navigate("/login");

                return;
            }


            if (response.status === 403) {

                setError(
                    "You do not have permission to access professor data."
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );
            }


            const data =
                await response.json();


            setProfessors(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (err) {

            console.error(
                "Error loading professors:",
                err
            );

            setError(
                "Unable to load professor data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // FILTER
    // =====================================================

    const filteredProfessors =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();


            if (!value) {
                return professors;
            }


            return professors.filter(
                (professor) =>
                    (
                        professor.professor_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(value)

                    ||

                    (
                        professor.email ||
                        ""
                    )
                        .toLowerCase()
                        .includes(value)

                    ||

                    String(
                        professor.professor_id
                    ).includes(value)
            );

        }, [
            professors,
            search
        ]);


    // =====================================================
    // SORT
    // =====================================================

    const sortedProfessors =
        [...filteredProfessors].sort(
            (a, b) => {

                if (
                    sort ===
                    "professor_id"
                ) {

                    return (
                        a.professor_id -
                        b.professor_id
                    );
                }


                if (
                    sort ===
                    "professor_name"
                ) {

                    return (
                        a.professor_name ||
                        ""
                    ).localeCompare(
                        b.professor_name ||
                        ""
                    );
                }


                if (
                    sort ===
                    "email"
                ) {

                    return (
                        a.email ||
                        ""
                    ).localeCompare(
                        b.email ||
                        ""
                    );
                }


                if (
                    sort ===
                    "role"
                ) {

                    return (
                        a.role ||
                        ""
                    ).localeCompare(
                        b.role ||
                        ""
                    );
                }


                if (
                    sort ===
                    "course_count"
                ) {

                    return (
                        (
                            a.courses?.length ||
                            0
                        ) -
                        (
                            b.courses?.length ||
                            0
                        )
                    );
                }


                return 0;
            }
        );


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalElements =
        sortedProfessors.length;


    const totalPages =
        Math.ceil(
            totalElements / size
        );


    const startIndex =
        page * size;


    const currentProfessors =
        sortedProfessors.slice(
            startIndex,
            startIndex + size
        );


    // =====================================================
    // SORT
    // =====================================================

    const handleSortChange = (
        event
    ) => {

        setSort(
            event.target.value
        );

        setPage(0);

    };


    // =====================================================
    // PREVIOUS
    // =====================================================

    const handlePrevious = () => {

        if (page > 0) {

            setPage(
                page - 1
            );
        }
    };


    // =====================================================
    // NEXT
    // =====================================================

    const handleNext = () => {

        if (
            page <
            totalPages - 1
        ) {

            setPage(
                page + 1
            );
        }
    };


    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {

        navigate(
            "/admin-dashboard"
        );

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-card">

                    <h2>
                        Loading Professor Management...
                    </h2>

                    <p>
                        Please wait.
                    </p>

                </div>

            </div>

        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-dashboard">


            {/* HEADER */}

            <header className="professor-header">

                <div>

                    <h1>
                        Professor Management
                    </h1>

                    <p>
                        View professors, assigned courses
                        and teaching workload.
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px"
                    }}
                >

                    <button
                        className="logout-button"
                        onClick={
                            loadProfessors
                        }
                    >
                        Refresh
                    </button>


                    <button
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* MAIN */}

            <section
                className="dashboard-section"
            >

                <div
                    className="section-heading"
                >

                    <div>

                        <h2>
                            All Professors
                        </h2>

                        <p>
                            Total professors:{" "}
                            <strong>
                                {
                                    totalElements
                                }
                            </strong>
                        </p>

                    </div>

                </div>


                {/* FILTER BAR */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px",
                        marginBottom: "20px"
                    }}
                >

                    {/* SEARCH */}

                    <div>

                        <label>
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event
                            ) => {

                                setSearch(
                                    event.target.value
                                );

                                setPage(0);

                            }}
                            placeholder="Name, email or ID"
                            style={{
                                width:
                                    "100%",
                                padding:
                                    "10px",
                                marginTop:
                                    "5px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "6px",
                                boxSizing:
                                    "border-box"
                            }}
                        />

                    </div>


                    {/* SORT */}

                    <div>

                        <label>
                            Sort by
                        </label>

                        <select
                            value={
                                sort
                            }
                            onChange={
                                handleSortChange
                            }
                            style={{
                                width:
                                    "100%",
                                padding:
                                    "10px",
                                marginTop:
                                    "5px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "6px"
                            }}
                        >

                            <option value="professor_name">
                                Professor Name
                            </option>

                            <option value="professor_id">
                                Professor ID
                            </option>

                            <option value="email">
                                Email
                            </option>

                            <option value="role">
                                Role
                            </option>

                            <option value="course_count">
                                Number of Courses
                            </option>

                        </select>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        className="dashboard-error"
                    >

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={
                                loadProfessors
                            }
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* EMPTY */}

                {!error &&
                sortedProfessors.length ===
                    0 ? (

                    <div
                        className="empty-state"
                    >

                        <div className="empty-icon">
                            👨‍🏫
                        </div>

                        <h3>
                            No professors found
                        </h3>

                        <p>
                            No professors match
                            your search.
                        </p>

                    </div>

                ) : (

                    <div
                        className="professor-list"
                    >

                        {currentProfessors.map(
                            (professor) => {

                                const courses =
                                    Array.isArray(
                                        professor.courses
                                    )
                                        ? professor.courses
                                        : [];


                                const totalStudents =
                                    courses.reduce(
                                        (
                                            total,
                                            course
                                        ) =>
                                            total +
                                            (
                                                course.enrollments
                                                    ?.length ||
                                                0
                                            ),
                                        0
                                    );


                                return (

                                    <div
                                        key={
                                            professor.professor_id
                                        }
                                        className="dashboard-card"
                                    >

                                        <div>

                                            <h3>
                                                {
                                                    professor.professor_name
                                                }
                                            </h3>


                                            <p>
                                                <strong>
                                                    Professor ID:
                                                </strong>{" "}
                                                {
                                                    professor.professor_id
                                                }
                                            </p>


                                            <p>
                                                <strong>
                                                    Email:
                                                </strong>{" "}
                                                {
                                                    professor.email
                                                }
                                            </p>


                                            <p>
                                                <strong>
                                                    Role:
                                                </strong>{" "}

                                                <span className="role-badge">
                                                    {
                                                        professor.role
                                                    }
                                                </span>
                                            </p>

                                        </div>


                                        {/* SUMMARY */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "15px",
                                                flexWrap:
                                                    "wrap",
                                                marginTop:
                                                    "15px"
                                            }}
                                        >

                                            <div className="info-box">

                                                <strong>
                                                    Courses
                                                </strong>

                                                <span>
                                                    {
                                                        courses.length
                                                    }
                                                </span>

                                            </div>


                                            <div className="info-box">

                                                <strong>
                                                    Students
                                                </strong>

                                                <span>
                                                    {
                                                        totalStudents
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {/* COURSES */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "15px"
                                            }}
                                        >

                                            <h4>
                                                Assigned Courses
                                            </h4>


                                            {courses.length >
                                            0 ? (

                                                <div>

                                                    {courses.map(
                                                        (course) => (

                                                            <div
                                                                key={
                                                                    course.course_id
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "12px",
                                                                    marginTop:
                                                                        "8px",
                                                                    border:
                                                                        "1px solid #ddd",
                                                                    borderRadius:
                                                                        "6px"
                                                                }}
                                                            >

                                                                <strong>
                                                                    {
                                                                        course.course_name
                                                                    }
                                                                </strong>


                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "5px",
                                                                        fontSize:
                                                                            "13px"
                                                                    }}
                                                                >

                                                                    Course #{
                                                                        course.course_id
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        course.credits
                                                                    }
                                                                    {" "}
                                                                    credits

                                                                    {" • "}

                                                                    {
                                                                        course.enrollments
                                                                            ?.length ||
                                                                        0
                                                                    }
                                                                    {" "}
                                                                    students

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            ) : (

                                                <p>
                                                    No courses assigned.
                                                </p>

                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}


                {/* PAGINATION */}

                <div
                    className="pagination"
                >

                    <button
                        onClick={
                            handlePrevious
                        }
                        disabled={
                            page ===
                            0
                        }
                    >
                        ← Previous
                    </button>


                    <span>

                        Page{" "}

                        <strong>
                            {
                                totalPages ===
                                0
                                    ? 0
                                    : page + 1
                            }
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {
                                totalPages
                            }
                        </strong>

                    </span>


                    <button
                        onClick={
                            handleNext
                        }
                        disabled={
                            totalPages === 0 ||
                            page >=
                                totalPages - 1
                        }
                    >
                        Next →
                    </button>

                </div>


                {/* BACK */}

                <div
                    style={{
                        marginTop:
                            "20px"
                    }}
                >

                    <button
                        className="logout-button"
                        onClick={
                            handleBack
                        }
                    >
                        ← Back to Admin Dashboard
                    </button>

                </div>

            </section>

        </div>
    );
}


export default ProfessorManagement;