import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getRole } from "../auth";
import { API_URL } from "../services/api";

const EnrollmentManagement = () => {

    const navigate = useNavigate();

    const [enrollments, setEnrollments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");


    // =====================================================
    // FETCH ALL ENROLLMENTS
    // =====================================================

    const fetchEnrollments = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Authentication token not found.");
                navigate("/login", { replace: true });
                return;
            }


            const response = await axios.get(
                `${API_URL}/admins/admin/enrollments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            setEnrollments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading enrollments:",
                err
            );


            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please log in again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to view enrollments."
                );

            } else {

                setError(
                    "Failed to load enrollments."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // CHECK ADMIN ROLE
    // =====================================================

    React.useEffect(() => {

        const role = getRole();

        console.log(
            "EnrollmentManagement role:",
            role
        );

        if (role !== "ROLE_ADMIN") {

            navigate(
                "/login",
                { replace: true }
            );

            return;
        }

        fetchEnrollments();

    }, [navigate]);


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div style={{ padding: "30px" }}>

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}
            >

                <div>

                    <h1>
                        Enrollment Management
                    </h1>

                    <p>
                        Manage student course assignments,
                        enrollment status, grades,
                        and enrollment records.
                    </p>

                </div>


                <button
                    onClick={() =>
                        navigate("/admin-dashboard")
                    }
                >
                    Back to Admin Dashboard
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        backgroundColor: "#f8d7da",
                        color: "#842029",
                        borderRadius: "6px"
                    }}
                >
                    {error}
                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <p>
                    Loading enrollments...
                </p>

            ) : (

                <>

                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <div
                        style={{
                            marginBottom: "20px",
                            fontSize: "18px",
                            fontWeight: "600"
                        }}
                    >

                        Total Enrollments:{" "}
                        {enrollments.length}

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div
                        style={{
                            overflowX: "auto"
                        }}
                    >

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}
                        >

                            <thead>

                                <tr>

                                    <th style={thStyle}>
                                        Enrollment ID
                                    </th>

                                    <th style={thStyle}>
                                        Student
                                    </th>

                                    <th style={thStyle}>
                                        Email
                                    </th>

                                    <th style={thStyle}>
                                        Course
                                    </th>

                                    <th style={thStyle}>
                                        Credits
                                    </th>

                                    <th style={thStyle}>
                                        Enrollment Date
                                    </th>

                                    <th style={thStyle}>
                                        Status
                                    </th>

                                    <th style={thStyle}>
                                        Grade
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {enrollments.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign: "center",
                                                padding: "20px"
                                            }}
                                        >
                                            No enrollments found.
                                        </td>

                                    </tr>

                                ) : (

                                    enrollments.map(
                                        (enrollment) => (

                                            <tr
                                                key={
                                                    enrollment.enrollment_id
                                                }
                                            >

                                                {/* Enrollment ID */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.enrollment_id
                                                    }

                                                </td>


                                                {/* Student */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.student_name ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Email */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.student_email ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Course */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.course_name ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Credits */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.credits ??
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Enrollment Date */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.enrollment_date ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Status */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.status ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* Grade */}

                                                <td style={tdStyle}>

                                                    {
                                                        enrollment.grade ||
                                                        "Not Graded"
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </>

            )}

        </div>
    );
};


// =====================================================
// TABLE STYLES
// =====================================================

const thStyle = {

    border: "1px solid #ddd",

    padding: "12px",

    textAlign: "left",

    backgroundColor: "#f4f4f4"
};


const tdStyle = {

    border: "1px solid #ddd",

    padding: "12px"
};


export default EnrollmentManagement;
