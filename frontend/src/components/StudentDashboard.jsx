import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";
// =====================================================
// API CLIENTS
// =====================================================

// Backend endpoints that start with /api
const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// Backend endpoints that start directly from /
const ROOT_API = axios.create({
  baseURL: API_URL,
});

// =====================================================
// ATTACH JWT TO EVERY REQUEST
// =====================================================

const attachToken = (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

API.interceptors.request.use(
  attachToken,
  (error) => Promise.reject(error)
);

ROOT_API.interceptors.request.use(
  attachToken,
  (error) => Promise.reject(error)
);

// =====================================================
// STUDENT DASHBOARD
// =====================================================

const StudentDashboard = () => {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [availableCourses, setAvailableCourses] =
    useState([]);

  const [myEnrollments, setMyEnrollments] =
    useState([]);

  const [profile, setProfile] = useState({
    student_id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [loadingEnrollments, setLoadingEnrollments] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [navigate]);

  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  const loadDashboard = async () => {
    clearMessages();

    await Promise.all([
      fetchCourses(),
      fetchMyEnrollments(),
      fetchProfile(),
    ]);
  };

  // ===================================================
  // FETCH AVAILABLE COURSES
  // ===================================================

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      console.log(
        "Loading available courses..."
      );

      const response = await ROOT_API.get(
        "/courses/getCourses"
      );

      console.log(
        "Courses response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setAvailableCourses(response.data);
      } else {
        setAvailableCourses([]);
      }
    } catch (err) {
      console.error(
        "Courses error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to view courses."
        );
        return;
      }

      setError(
        "Failed to load available courses."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  // ===================================================
  // FETCH CURRENT STUDENT ENROLLMENTS
  // ===================================================

  const fetchMyEnrollments = async () => {
    try {
      setLoadingEnrollments(true);

      console.log(
        "Loading my enrollments..."
      );

      const response = await API.get(
        "/enrollments/my"
      );

      console.log(
        "My enrollments response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setMyEnrollments(response.data);
      } else {
        setMyEnrollments([]);
      }
    } catch (err) {
      console.error(
        "Enrollments error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to view your enrollments."
        );
        return;
      }

      setError(
        "Failed to load your enrollments."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // ===================================================
  // FETCH LOGGED-IN STUDENT PROFILE
  // ===================================================

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      console.log(
        "Loading logged-in student's profile..."
      );

      /*
       * The backend identifies the student
       * from the JWT.
       *
       * No studentId is needed in localStorage.
       */

      const response = await ROOT_API.get(
        "/student/me"
      );

      console.log(
        "My profile response:",
        response.data
      );

      if (response.data) {
        setProfile({
          student_id:
            response.data.student_id ??
            response.data.studentId ??
            "",

          firstName:
            response.data.firstName ??
            response.data.first_name ??
            "",

          lastName:
            response.data.lastName ??
            response.data.last_name ??
            "",

          email:
            response.data.email ??
            "",

          role:
            response.data.role ??
            "",
        });
      }
    } catch (err) {
      console.error(
        "Profile error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to access your profile."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to load your profile."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // ===================================================
  // ENROLL IN COURSE
  // ===================================================

  const handleEnroll = async (courseId) => {
    try {
      clearMessages();

      if (!courseId) {
        setError("Invalid course selected.");
        return;
      }

      console.log(
        "Enrolling in course:",
        courseId
      );

      /*
       * Only course_id is sent.
       *
       * The backend determines the student
       * from the JWT Authentication object.
       */

      await API.post(
        "/enrollments",
        {
          course_id: Number(courseId),
        }
      );

      setMessage(
        "Successfully enrolled in the course."
      );

      await fetchMyEnrollments();

      setActiveSection(
        "enrollments"
      );
    } catch (err) {
      console.error(
        "Enrollment error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to enroll in this course."
        );
        return;
      }

      if (err.response?.status === 404) {
        setError(
          "The selected course could not be found."
        );
        return;
      }

      if (err.response?.status === 409) {
        setError(
          "You are already enrolled in this course."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Enrollment failed."
      );
    }
  };

  // ===================================================
  // DROP COURSE
  // ===================================================

  const handleDropCourse = async (
    enrollmentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to drop this course?"
    );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      console.log(
        "Dropping enrollment:",
        enrollmentId
      );

      await API.delete(
        `/enrollments/${enrollmentId}`
      );

      setMessage(
        "Course dropped successfully."
      );

      await fetchMyEnrollments();
    } catch (err) {
      console.error(
        "Drop course error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to drop this enrollment."
        );
        return;
      }

      if (err.response?.status === 404) {
        setError(
          "Enrollment was not found."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to drop the course."
      );
    }
  };

  // ===================================================
  // UPDATE MY PROFILE
  // ===================================================

  const handleUpdateProfile = async (
    event
  ) => {
    event.preventDefault();

    clearMessages();

    try {
      setLoadingProfile(true);

      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      };

      console.log(
        "Updating my profile:",
        updateData
      );

      /*
       * IMPORTANT:
       *
       * Student-specific endpoint:
       *
       * PUT /student/me
       *
       * The backend identifies the student
       * from the JWT.
       */

      const response = await ROOT_API.put(
        "/student/me",
        updateData
      );

      console.log(
        "Profile update response:",
        response.data
      );

      if (response.data) {
        setProfile({
          student_id:
            response.data.student_id ??
            response.data.studentId ??
            profile.student_id,

          firstName:
            response.data.firstName ??
            response.data.first_name ??
            "",

          lastName:
            response.data.lastName ??
            response.data.last_name ??
            "",

          email:
            response.data.email ??
            "",

          role:
            response.data.role ??
            profile.role,
        });
      }

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to update your profile."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update profile."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentId");
    localStorage.removeItem("userEmail");

    navigate("/");
  };

  // ===================================================
  // SESSION EXPIRED
  // ===================================================

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentId");
    localStorage.removeItem("userEmail");

    navigate("/");
  };

  // ===================================================
  // CLEAR MESSAGES
  // ===================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ===================================================
  // COURSE HELPERS
  // ===================================================

  const getCourseId = (course) => {
    return (
      course.course_id ??
      course.courseId ??
      course.id
    );
  };

  const getCourseName = (course) => {
    return (
      course.course_name ??
      course.courseName ??
      course.name ??
      "Unnamed Course"
    );
  };

  const getCourseDescription = (course) => {
    return (
      course.course_description ??
      course.courseDescription ??
      course.description ??
      "No description available."
    );
  };

  const getCourseCode = (course) => {
    return (
      course.course_code ??
      course.courseCode ??
      course.code ??
      ""
    );
  };

  // ===================================================
  // DASHBOARD
  // ===================================================

  const renderDashboard = () => {
    return (
      <div>
        <h1>
          Student Dashboard
        </h1>

        <p
          style={{
            fontSize: "18px",
            marginTop: "10px",
          }}
        >
          Welcome,{" "}
          <strong>
            {profile.firstName ||
              "Student"}
          </strong>
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >

          {/* AVAILABLE COURSES */}

          <div
            style={cardStyle}
            onClick={() => {
              clearMessages();
              setActiveSection(
                "courses"
              );
            }}
          >
            <h2>
              Available Courses
            </h2>

            <p
              style={{
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              {availableCourses.length}
            </p>

            <p>
              Browse available courses
            </p>
          </div>

          {/* MY ENROLLMENTS */}

          <div
            style={cardStyle}
            onClick={() => {
              clearMessages();
              setActiveSection(
                "enrollments"
              );
            }}
          >
            <h2>
              My Enrollments
            </h2>

            <p
              style={{
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              {myEnrollments.length}
            </p>

            <p>
              View your enrolled courses
            </p>
          </div>

          {/* MY PROFILE */}

          <div
            style={cardStyle}
            onClick={() => {
              clearMessages();
              setActiveSection(
                "profile"
              );
            }}
          >
            <h2>
              My Profile
            </h2>

            <p>
              View and update your profile
            </p>
          </div>

        </div>
      </div>
    );
  };

  // ===================================================
  // AVAILABLE COURSES
  // ===================================================

  const renderCourses = () => {
    return (
      <div>

        <div
          style={
            sectionHeaderStyle
          }
        >
          <h1>
            Available Courses
          </h1>

          <button
            onClick={fetchCourses}
            style={
              secondaryButtonStyle
            }
          >
            Refresh
          </button>
        </div>

        {loadingCourses ? (
          <p>
            Loading courses...
          </p>
        ) : availableCourses.length === 0 ? (
          <div
            style={emptyStyle}
          >
            <p>
              No courses are currently available.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {availableCourses.map(
              (course) => {

                const courseId =
                  getCourseId(course);

                const courseName =
                  getCourseName(course);

                const courseDescription =
                  getCourseDescription(
                    course
                  );

                const courseCode =
                  getCourseCode(course);

                return (
                  <div
                    key={courseId}
                    style={
                      courseCardStyle
                    }
                  >

                    <h2>
                      {courseName}
                    </h2>

                    {courseCode && (
                      <p>
                        <strong>
                          Course Code:
                        </strong>{" "}
                        {courseCode}
                      </p>
                    )}

                    <p>
                      {courseDescription}
                    </p>

                    <button
                      onClick={() =>
                        handleEnroll(
                          courseId
                        )
                      }
                      style={
                        primaryButtonStyle
                      }
                    >
                      Enroll
                    </button>

                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  // ===================================================
  // MY ENROLLMENTS
  // ===================================================

  const renderEnrollments = () => {
    return (
      <div>

        <div
          style={
            sectionHeaderStyle
          }
        >
          <h1>
            My Enrollments
          </h1>

          <button
            onClick={
              fetchMyEnrollments
            }
            style={
              secondaryButtonStyle
            }
          >
            Refresh
          </button>
        </div>

        {loadingEnrollments ? (
          <p>
            Loading your enrollments...
          </p>
        ) : myEnrollments.length === 0 ? (
          <div
            style={emptyStyle}
          >
            <p>
              You are not enrolled in any courses.
            </p>

            <button
              onClick={() => {
                clearMessages();
                setActiveSection(
                  "courses"
                );
              }}
              style={
                primaryButtonStyle
              }
            >
              Browse Courses
            </button>
          </div>
        ) : (

          <div
            style={{
              overflowX: "auto",
              background: "#fff",
              borderRadius: "8px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >

              <thead>
                <tr>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Enrollment ID
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Course
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Credits
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Enrollment Date
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Grade
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {myEnrollments.map(
                  (enrollment) => {

                    const enrollmentId =
                      enrollment.enrollment_id ??
                      enrollment.enrollmentId;

                    const courseName =
                      enrollment.course_name ??
                      enrollment.courseName ??
                      "Course information unavailable";

                    const credits =
                      enrollment.credits ??
                      "-";

                    const enrollmentDate =
                      enrollment.enrollment_date ??
                      enrollment.enrollmentDate ??
                      "-";

                    const status =
                      enrollment.status ??
                      "-";

                    const grade =
                      enrollment.grade ??
                      "Not graded";

                    return (
                      <tr
                        key={
                          enrollmentId
                        }
                      >

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {enrollmentId ??
                            "-"}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <strong>
                            {courseName}
                          </strong>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {credits}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {enrollmentDate}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 10px",
                              borderRadius:
                                "15px",
                              background:
                                status ===
                                "ACTIVE"
                                  ? "#d4edda"
                                  : "#f8d7da",
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {grade}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <button
                            onClick={() =>
                              handleDropCourse(
                                enrollmentId
                              )
                            }
                            style={
                              dangerButtonStyle
                            }
                          >
                            Drop
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}
      </div>
    );
  };

  // ===================================================
  // MY PROFILE
  // ===================================================

  const renderProfile = () => {
    return (
      <div>

        <div
          style={
            sectionHeaderStyle
          }
        >
          <h1>
            My Profile
          </h1>

          <button
            onClick={
              fetchProfile
            }
            style={
              secondaryButtonStyle
            }
          >
            Refresh
          </button>
        </div>

        {loadingProfile &&
          !profile.student_id && (
            <p>
              Loading profile...
            </p>
          )}

        <div
          style={
            profileCardStyle
          }
        >

          {/* ==========================================
              EXISTING PROFILE INFORMATION
              ========================================== */}

          <h2>
            Profile Information
          </h2>

          <div
            style={{
              marginTop: "20px",
              marginBottom: "25px",
            }}
          >

            <div
              style={
                profileRowStyle
              }
            >
              <span
                style={
                  profileLabelStyle
                }
              >
                Student ID
              </span>

              <span
                style={
                  profileValueStyle
                }
              >
                {profile.student_id ||
                  "—"}
              </span>
            </div>

            <div
              style={
                profileRowStyle
              }
            >
              <span
                style={
                  profileLabelStyle
                }
              >
                First Name
              </span>

              <span
                style={
                  profileValueStyle
                }
              >
                {profile.firstName ||
                  "—"}
              </span>
            </div>

            <div
              style={
                profileRowStyle
              }
            >
              <span
                style={
                  profileLabelStyle
                }
              >
                Last Name
              </span>

              <span
                style={
                  profileValueStyle
                }
              >
                {profile.lastName ||
                  "—"}
              </span>
            </div>

            <div
              style={
                profileRowStyle
              }
            >
              <span
                style={
                  profileLabelStyle
                }
              >
                Email
              </span>

              <span
                style={
                  profileValueStyle
                }
              >
                {profile.email ||
                  "—"}
              </span>
            </div>

            <div
              style={
                profileRowStyle
              }
            >
              <span
                style={
                  profileLabelStyle
                }
              >
                Role
              </span>

              <span
                style={
                  profileValueStyle
                }
              >
                {profile.role ||
                  "—"}
              </span>
            </div>

          </div>

          <hr
            style={{
              border: "none",
              borderTop:
                "1px solid #e5e7eb",
              margin:
                "25px 0",
            }}
          />

          {/* ==========================================
              UPDATE PROFILE
              ========================================== */}

          <h2>
            Update Profile
          </h2>

          <form
            onSubmit={
              handleUpdateProfile
            }
            style={{
              marginTop: "20px",
            }}
          >

            {/* FIRST NAME */}

            <div
              style={
                fieldStyle
              }
            >

              <label
                style={
                  labelStyle
                }
              >
                First Name
              </label>

              <input
                type="text"
                value={
                  profile.firstName
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    firstName:
                      e.target.value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />

            </div>

            {/* LAST NAME */}

            <div
              style={
                fieldStyle
              }
            >

              <label
                style={
                  labelStyle
                }
              >
                Last Name
              </label>

              <input
                type="text"
                value={
                  profile.lastName
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    lastName:
                      e.target.value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />

            </div>

            {/* EMAIL */}

            <div
              style={
                fieldStyle
              }
            >

              <label
                style={
                  labelStyle
                }
              >
                Email
              </label>

              <input
                type="email"
                value={
                  profile.email
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email:
                      e.target.value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />

            </div>

            {/* UPDATE BUTTON */}

            <button
              type="submit"
              disabled={
                loadingProfile ||
                !profile.student_id
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  loadingProfile ||
                  !profile.student_id
                    ? 0.6
                    : 1,
              }}
            >
              {loadingProfile
                ? "Updating..."
                : "Update Profile"}
            </button>

          </form>

        </div>

      </div>
    );
  };

  // ===================================================
  // CONTENT SWITCH
  // ===================================================

  const renderContent = () => {
    switch (activeSection) {

      case "courses":
        return renderCourses();

      case "enrollments":
        return renderEnrollments();

      case "profile":
        return renderProfile();

      case "dashboard":
      default:
        return renderDashboard();
    }
  };

  // ===================================================
  // MAIN JSX
  // ===================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f6fa",
      }}
    >

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "#1f2937",
          color: "#fff",
          padding: "25px 15px",
          boxSizing: "border-box",
        }}
      >

        <h2
          style={{
            textAlign: "center",
            marginBottom:
              "30px",
          }}
        >
          Student Portal
        </h2>

        <nav>

          {/* DASHBOARD */}

          <button
            onClick={() => {
              clearMessages();
              setActiveSection(
                "dashboard"
              );
            }}
            style={
              getNavButtonStyle(
                activeSection ===
                  "dashboard"
              )
            }
          >
            Dashboard
          </button>

          {/* AVAILABLE COURSES */}

          <button
            onClick={() => {
              clearMessages();
              setActiveSection(
                "courses"
              );
            }}
            style={
              getNavButtonStyle(
                activeSection ===
                  "courses"
              )
            }
          >
            Available Courses
          </button>

          {/* MY ENROLLMENTS */}

          <button
            onClick={() => {
              clearMessages();
              setActiveSection(
                "enrollments"
              );
            }}
            style={
              getNavButtonStyle(
                activeSection ===
                  "enrollments"
              )
            }
          >
            My Enrollments
          </button>

          {/* MY PROFILE */}

          <button
            onClick={() => {
              clearMessages();
              setActiveSection(
                "profile"
              );
            }}
            style={
              getNavButtonStyle(
                activeSection ===
                  "profile"
              )
            }
          >
            My Profile
          </button>

          {/* LOGOUT */}

          <button
            onClick={
              handleLogout
            }
            style={{
              ...navButtonStyle,
              marginTop: "30px",
              background:
                "#dc3545",
            }}
          >
            Logout
          </button>

        </nav>
      </aside>

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main
        style={{
          flex: 1,
          padding: "35px",
          boxSizing: "border-box",
        }}
      >

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              background:
                "#d4edda",
              color:
                "#155724",
              padding:
                "12px 15px",
              borderRadius:
                "6px",
              marginBottom:
                "20px",
            }}
          >
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div
            style={{
              background:
                "#f8d7da",
              color:
                "#721c24",
              padding:
                "12px 15px",
              borderRadius:
                "6px",
              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* PAGE CONTENT */}

        {renderContent()}

      </main>

    </div>
  );
};

// =====================================================
// STYLES
// =====================================================

const navButtonStyle = {
  width: "100%",
  padding: "12px 15px",
  marginBottom: "8px",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "15px",
};

const getNavButtonStyle = (active) => ({
  ...navButtonStyle,
  background: active
    ? "#374151"
    : "transparent",
});

const cardStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "10px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
};

const courseCardStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "10px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.1)",
};

const profileCardStyle = {
  maxWidth: "700px",
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.1)",
};

const profileRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom:
    "1px solid #f0f0f0",
  gap: "20px",
};

const profileLabelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
};

const profileValueStyle = {
  fontSize: "16px",
  color: "#111827",
  fontWeight: "500",
  textAlign: "right",
};

const primaryButtonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  padding: "10px 18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const dangerButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "5px",
  background: "#dc3545",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const emptyStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  textAlign: "center",
};

const tableHeaderStyle = {
  padding: "12px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "20px",
  gap: "7px",
};

const labelStyle = {
  fontWeight: "600",
  fontSize: "14px",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "15px",
  width: "100%",
  boxSizing: "border-box",
};

export default StudentDashboard;