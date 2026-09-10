import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
    getToken,
    getRole,
    logout
} from "../auth";

function DepartmentManagement() {

    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [sort, setSort] = useState("department_name");
    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================
    // LOAD DEPARTMENTS
    // =========================
    useEffect(() => {
        loadDepartments();
    }, []);


    const loadDepartments = async () => {

        const token = getToken();
        const role = getRole();

        console.log("=== DEPARTMENT MANAGEMENT STARTED ===");
        console.log(
            "Department Management token:",
            !!token
        );

        console.log(
            "Department Management role:",
            role
        );


        if (!token) {

            logout();
            navigate("/login");
            return;

        }


        try {

            setLoading(true);
            setError("");


            const response = await fetch(
                `${API_URL}/api/department/getData`,
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            console.log(
                "Department Management API status:",
                response.status
            );


            if (response.status === 401) {

                logout();
                navigate("/login");
                return;

            }


            if (response.status === 403) {

                setError(
                    "You do not have permission to access department data."
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
                "Department Management API data:",
                data
            );


            setDepartments(data || []);

        } catch (error) {

            console.error(
                "Error loading departments:",
                error
            );


            setError(
                "Unable to load department data."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // SORT DEPARTMENTS
    // =========================
    const sortedDepartments = [...departments].sort(
        (a, b) => {

            const valueA = a[sort];
            const valueB = b[sort];


            if (
                typeof valueA === "number" &&
                typeof valueB === "number"
            ) {

                return valueA - valueB;

            }


            return String(valueA ?? "")
                .toLowerCase()
                .localeCompare(
                    String(valueB ?? "").toLowerCase()
                );

        }
    );


    // =========================
    // PAGINATION
    // =========================
    const totalElements = departments.length;

    const totalPages = Math.ceil(
        totalElements / size
    );

    const startIndex = page * size;

    const currentDepartments =
        sortedDepartments.slice(
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
    // PAGINATION
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

                        <h1>
                            Department Management
                        </h1>

                        <p>
                            Manage academic departments
                            and organizational data.
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
                        Loading departments...
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

                        <h1>
                            Department Management
                        </h1>

                        <p>
                            Manage academic departments
                            and organizational data.
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

                    <h3>
                        Unable to Load Departments
                    </h3>

                    <p>
                        {error}
                    </p>


                    <button
                        className="dashboard-button"
                        onClick={loadDepartments}
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

                    <h1>
                        Department Management
                    </h1>

                    <p>
                        Manage academic departments
                        and organizational data.
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


            {/* DEPARTMENT SECTION */}
            <section className="dashboard-section">


                <div className="section-heading">

                    <div>

                        <h2>
                            All Departments
                        </h2>

                        <p>
                            Total Departments:{" "}
                            <strong>
                                {totalElements}
                            </strong>
                        </p>

                    </div>


                    {/* SORT */}
                    <div>

                        <label htmlFor="department-sort">
                            Sort by:
                        </label>


                        <select
                            id="department-sort"
                            value={sort}
                            onChange={handleSortChange}
                        >

                            <option value="department_name">
                                Department Name
                            </option>

                            <option value="department_id">
                                Department ID
                            </option>

                            <option value="head_of_department">
                                Head of Department
                            </option>

                        </select>

                    </div>

                </div>


                {/* NO DEPARTMENTS */}
                {departments.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🏢
                        </div>


                        <h3>
                            No Departments Found
                        </h3>


                        <p>
                            There are currently no academic
                            departments available.
                        </p>

                    </div>

                ) : (


                    <div className="professor-list">


                        {currentDepartments.map(
                            (department) => (

                                <div
                                    className="dashboard-card"
                                    key={
                                        department.department_id
                                    }
                                >


                                    {/* DEPARTMENT HEADER */}
                                    <div className="card-header">

                                        <div>

                                            <h3>
                                                {
                                                    department.department_name
                                                }
                                            </h3>


                                            <span className="role-badge">
                                                DEPARTMENT
                                            </span>

                                        </div>

                                    </div>


                                    {/* DEPARTMENT INFORMATION */}
                                    <div className="card-content">


                                        <div>

                                            <strong>
                                                Department ID:
                                            </strong>

                                            <span>
                                                {
                                                    department.department_id
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                Department Name:
                                            </strong>

                                            <span>
                                                {
                                                    department.department_name
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                Head of Department:
                                            </strong>

                                            <span>
                                                {
                                                    department.head_of_department
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    {/* ORGANIZATIONAL DATA */}
                                    <div className="course-section">

                                        <h4>
                                            Organizational Information
                                        </h4>

                                        <p>
                                            This department is
                                            registered in the
                                            Student Information
                                            Management System.
                                        </p>

                                    </div>

                                </div>

                            )
                        )}

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


            {/* BACK TO ADMIN */}
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

export default DepartmentManagement;