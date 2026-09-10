import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { API_URL } from "../services/api";
import { useNavigate } from "react-router-dom";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = API_URL;


// ============================================================
// AUTH HELPERS
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};


const getRole = () => {

    const token = getToken();

    if (!token) {
        return null;
    }

    try {

        const payload = JSON.parse(
            atob(token.split(".")[1])
        );

        return payload.role;

    } catch (error) {

        console.error(
            "Unable to read JWT:",
            error
        );

        return null;
    }
};


const logout = () => {
    localStorage.removeItem("token");
};


// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {

    const navigate = useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [students, setStudents] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);


    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const [activeSection, setActiveSection] =
        useState("overview");


    const [studentSearch, setStudentSearch] =
        useState("");

    const [professorSearch, setProfessorSearch] =
        useState("");

    const [courseSearch, setCourseSearch] =
        useState("");

    const [departmentSearch, setDepartmentSearch] =
        useState("");

    const [enrollmentSearch, setEnrollmentSearch] =
        useState("");


    const [modal, setModal] =
        useState(null);

    const [selectedItem, setSelectedItem] =
        useState(null);

    const [formData, setFormData] =
        useState({});


    // ========================================================
    // AUTHORIZATION
    // ========================================================

    useEffect(() => {

        const token = getToken();
        const role = getRole();

        if (!token) {

            navigate("/login", {
                replace: true
            });

            return;
        }


        if (role !== "ROLE_ADMIN") {

            navigate("/login", {
                replace: true
            });

            return;
        }

    }, [navigate]);


    // ========================================================
    // SAFE API REQUEST
    // ========================================================

    const apiRequest = async (
        endpoint,
        options = {}
    ) => {

        const token = getToken();


        if (!token) {

            logout();

            navigate("/login");

            throw new Error(
                "Your session has expired. Please login again."
            );
        }


        const headers = {

            Accept:
                "application/json, text/plain, */*",

            Authorization:
                `Bearer ${token}`,

            ...(options.body
                ? {
                    "Content-Type":
                        "application/json"
                }
                : {}),

            ...(options.headers || {})
        };


        let response;

        try {

            response = await fetch(
                `${API_BASE}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

        } catch (networkError) {

            console.error(
                "Network error:",
                networkError
            );

            throw new Error(
                "Unable to connect to the server."
            );
        }


        // ====================================================
        // UNAUTHORIZED
        // ====================================================

        if (response.status === 401) {

            logout();

            navigate("/login");

            throw new Error(
                "Your session has expired. Please login again."
            );
        }


        // ====================================================
        // FORBIDDEN
        // ====================================================

        if (response.status === 403) {

            throw new Error(
                "You do not have permission to perform this administrator action."
            );
        }


        // ====================================================
        // READ RESPONSE SAFELY
        //
        // IMPORTANT:
        // DELETE endpoints may return:
        //
        // "Student with id 15 deleted successfully"
        //
        // instead of JSON.
        // ====================================================

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let responseData = null;


        if (response.status !== 204) {

            const rawText =
                await response.text();


            if (rawText && rawText.trim()) {

                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {

                    try {

                        responseData =
                            JSON.parse(rawText);

                    } catch (jsonError) {

                        console.warn(
                            "Response was marked JSON but contained non-JSON text:",
                            rawText
                        );

                        responseData =
                            rawText;
                    }

                } else {

                    // Plain text response
                    responseData =
                        rawText;
                }
            }
        }


        // ====================================================
        // HTTP ERROR
        // ====================================================

        if (!response.ok) {

            let message =
                `Request failed with status ${response.status}`;


            if (
                responseData &&
                typeof responseData === "object"
            ) {

                message =
                    responseData.message ||
                    responseData.error ||
                    responseData.detail ||
                    message;

            } else if (
                typeof responseData === "string" &&
                responseData.trim()
            ) {

                message =
                    responseData;
            }


            throw new Error(message);
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        return responseData;
    };


    // ========================================================
    // FETCH ADMIN DATA
    // ========================================================

    const fetchDashboardData = async (
        showRefreshLoader = false
    ) => {

        try {

            setError("");


            if (showRefreshLoader) {

                setRefreshing(true);

            } else {

                setLoading(true);
            }


            // ------------------------------------------------
            // Do NOT use Promise.all here.
            //
            // If one endpoint fails, we still want the
            // remaining dashboard data to load.
            // ------------------------------------------------

            const results =
                await Promise.allSettled([

                    apiRequest(
                        "/student/getData"
                    ),

                    apiRequest(
                        "/professor/getData"
                    ),

                    apiRequest(
                        "/courses/getCourses"
                    ),

                    apiRequest(
                        "/api/department/getData"
                    ),

                    apiRequest(
                        "/admins/admin/enrollments"
                    )

                ]);


            // =================================================
            // STUDENTS
            // =================================================

            if (
                results[0].status ===
                "fulfilled"
            ) {

                const data =
                    results[0].value;

                setStudents(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );

            } else {

                console.error(
                    "Student API error:",
                    results[0].reason
                );
            }


            // =================================================
            // PROFESSORS
            // =================================================

            if (
                results[1].status ===
                "fulfilled"
            ) {

                const data =
                    results[1].value;

                setProfessors(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );

            } else {

                console.error(
                    "Professor API error:",
                    results[1].reason
                );
            }


            // =================================================
            // COURSES
            // =================================================

            if (
                results[2].status ===
                "fulfilled"
            ) {

                const data =
                    results[2].value;

                setCourses(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );

            } else {

                console.error(
                    "Course API error:",
                    results[2].reason
                );
            }


            // =================================================
            // DEPARTMENTS
            // =================================================

            if (
                results[3].status ===
                "fulfilled"
            ) {

                const data =
                    results[3].value;

                setDepartments(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );

            } else {

                console.error(
                    "Department API error:",
                    results[3].reason
                );
            }


            // =================================================
            // ENROLLMENTS
            // =================================================

            if (
                results[4].status ===
                "fulfilled"
            ) {

                const data =
                    results[4].value;

                setEnrollments(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );

            } else {

                console.error(
                    "Enrollment API error:",
                    results[4].reason
                );
            }


            // ------------------------------------------------
            // Show error only if every request failed
            // ------------------------------------------------

            const failedCount =
                results.filter(
                    result =>
                        result.status ===
                        "rejected"
                ).length;


            if (failedCount === 5) {

                const firstError =
                    results[0].reason;

                throw new Error(
                    firstError?.message ||
                    "Unable to load administrator data."
                );
            }


        } catch (err) {

            console.error(
                "Admin dashboard fetch error:",
                err
            );

            setError(
                err.message ||
                "Unable to load administrator data."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        const token = getToken();
        const role = getRole();

        if (
            token &&
            role === "ROLE_ADMIN"
        ) {

            fetchDashboardData(false);
        }

    }, []);


    // ========================================================
    // SUCCESS / ERROR
    // ========================================================

    const showSuccess = (
        message
    ) => {

        setSuccess(message);
        setError("");

        setTimeout(() => {

            setSuccess("");

        }, 4000);
    };


    const showError = (
        message
    ) => {

        setError(
            message ||
            "Action failed."
        );

        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {

        logout();

        navigate("/login");
    };


    // ========================================================
    // SEARCH FILTERS
    // ========================================================

    const filteredStudents =
        useMemo(() => {

            const search =
                studentSearch
                    .toLowerCase()
                    .trim();


            if (!search) {
                return students;
            }


            return students.filter(
                student => {

                    const text = [

                        student.student_id,

                        student.studentId,

                        student.firstName,

                        student.lastName,

                        student.email,

                        student.role

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );

        }, [
            students,
            studentSearch
        ]);


    const filteredProfessors =
        useMemo(() => {

            const search =
                professorSearch
                    .toLowerCase()
                    .trim();


            if (!search) {
                return professors;
            }


            return professors.filter(
                professor => {

                    const text = [

                        professor.professor_id,

                        professor.professorId,

                        professor.firstName,

                        professor.lastName,

                        professor.email,

                        professor.role,

                        professor.department

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );

        }, [
            professors,
            professorSearch
        ]);


    const filteredCourses =
        useMemo(() => {

            const search =
                courseSearch
                    .toLowerCase()
                    .trim();


            if (!search) {
                return courses;
            }


            return courses.filter(
                course => {

                    const text = [

                        course.course_id,

                        course.courseId,

                        course.course_name,

                        course.courseName,

                        course.name,

                        course.description,

                        course.credits,

                        course.department

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );

        }, [
            courses,
            courseSearch
        ]);


    const filteredDepartments =
        useMemo(() => {

            const search =
                departmentSearch
                    .toLowerCase()
                    .trim();


            if (!search) {
                return departments;
            }


            return departments.filter(
                department => {

                    const text = [

                        department.department_id,

                        department.departmentId,

                        department.department_name,

                        department.departmentName,

                        department.name,

                        department.description

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );

        }, [
            departments,
            departmentSearch
        ]);


    const filteredEnrollments =
        useMemo(() => {

            const search =
                enrollmentSearch
                    .toLowerCase()
                    .trim();


            if (!search) {
                return enrollments;
            }


            return enrollments.filter(
                enrollment => {

                    const text = [

                        enrollment.enrollment_id,

                        enrollment.enrollmentId,

                        enrollment.student_id,

                        enrollment.studentId,

                        enrollment.student_name,

                        enrollment.course_id,

                        enrollment.courseId,

                        enrollment.course_name,

                        enrollment.grade,

                        enrollment.status,

                        enrollment.enrollment_date

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );

        }, [
            enrollments,
            enrollmentSearch
        ]);


    // ========================================================
    // ID HELPERS
    // ========================================================

    const getStudentId =
        student =>
            student?.student_id ??
            student?.studentId ??
            student?.id;


    const getProfessorId =
        professor =>
            professor?.professor_id ??
            professor?.professorId ??
            professor?.id;


    const getCourseId =
        course =>
            course?.course_id ??
            course?.courseId ??
            course?.id;


    const getDepartmentId =
        department =>
            department?.department_id ??
            department?.departmentId ??
            department?.id;


    const getEnrollmentId =
        enrollment =>
            enrollment?.enrollment_id ??
            enrollment?.enrollmentId ??
            enrollment?.id;


    // ========================================================
    // NAME HELPERS
    // ========================================================

    const getStudentName =
        student => {

            const fullName =
                `${student?.firstName || ""} ${student?.lastName || ""
                    }`.trim();


            return (
                fullName ||
                student?.name ||
                student?.fullName ||
                student?.email ||
                `Student ${getStudentId(student)}`
            );
        };


    const getProfessorName =
        professor => {

            const fullName =
                `${professor?.firstName || ""} ${professor?.lastName || ""
                    }`.trim();


            return (
                fullName ||
                professor?.name ||
                professor?.fullName ||
                professor?.email ||
                `Professor ${getProfessorId(
                    professor
                )}`
            );
        };


    const getCourseName =
        course => {

            return (
                course?.course_name ||
                course?.courseName ||
                course?.name ||
                `Course ${getCourseId(course)}`
            );
        };


    const getDepartmentName =
        department => {

            return (
                department?.department_name ||
                department?.departmentName ||
                department?.name ||
                `Department ${getDepartmentId(
                    department
                )}`
            );
        };


    // ========================================================
    // ENROLLMENT DISPLAY
    // ========================================================

    const getEnrollmentStudent =
        enrollment => {

            if (
                enrollment?.student_name
            ) {

                const id =
                    enrollment.student_id ??
                    enrollment.studentId;


                return id !== undefined
                    ? `${enrollment.student_name} (#${id})`
                    : enrollment.student_name;
            }


            if (
                enrollment?.student
            ) {

                const student =
                    enrollment.student;

                return `${getStudentName(
                    student
                )} (#${getStudentId(
                    student
                )})`;
            }


            const studentId =
                enrollment?.student_id ??
                enrollment?.studentId;


            if (
                studentId !== undefined &&
                studentId !== null
            ) {

                const student =
                    students.find(
                        item =>
                            String(
                                getStudentId(item)
                            ) ===
                            String(studentId)
                    );


                if (student) {

                    return `${getStudentName(
                        student
                    )} (#${studentId})`;
                }


                return `Student #${studentId}`;
            }


            return "—";
        };


    const getEnrollmentCourse =
        enrollment => {

            if (
                enrollment?.course_name
            ) {

                const id =
                    enrollment.course_id ??
                    enrollment.courseId;


                return id !== undefined
                    ? `${enrollment.course_name} (#${id})`
                    : enrollment.course_name;
            }


            if (
                enrollment?.course
            ) {

                const course =
                    enrollment.course;

                return `${getCourseName(
                    course
                )} (#${getCourseId(
                    course
                )})`;
            }


            const courseId =
                enrollment?.course_id ??
                enrollment?.courseId;


            if (
                courseId !== undefined &&
                courseId !== null
            ) {

                const course =
                    courses.find(
                        item =>
                            String(
                                getCourseId(item)
                            ) ===
                            String(courseId)
                    );


                if (course) {

                    return `${getCourseName(
                        course
                    )} (#${courseId})`;
                }


                return `Course #${courseId}`;
            }


            return "—";
        };


    // ========================================================
    // MODAL
    // ========================================================

    const openModal = (
        type,
        item = null
    ) => {

        setSelectedItem(item);
        setError("");


        if (
            type === "add-professor"
        ) {

            setFormData({

                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "PROFESSOR"

            });
        }


        if (
            type === "edit-professor"
        ) {

            setFormData({

                firstName:
                    item?.firstName || "",

                lastName:
                    item?.lastName || "",

                email:
                    item?.email || ""

            });
        }


        if (
            type === "add-course"
        ) {

            setFormData({

                course_name: "",
                description: "",
                credits: "",
                department_id: "",
                professor_id: ""

            });
        }


        if (
            type === "edit-course"
        ) {

            setFormData({

                course_name:
                    item?.course_name ||
                    item?.courseName ||
                    item?.name ||
                    "",

                description:
                    item?.description ||
                    "",

                credits:
                    item?.credits ?? "",

                department_id:
                    item?.department_id ??
                    item?.departmentId ??
                    item?.department?.department_id ??
                    "",

                professor_id:
                    item?.professor_id ??
                    item?.professorId ??
                    item?.professor?.professor_id ??
                    ""

            });
        }


        if (
            type === "add-department"
        ) {

            setFormData({

                department_name: "",
                description: ""

            });
        }


        if (
            type === "edit-department"
        ) {

            setFormData({

                department_name:
                    item?.department_name ||
                    item?.departmentName ||
                    item?.name ||
                    "",

                description:
                    item?.description ||
                    ""

            });
        }
        if (
            type === "create-student"
        ) {

            setFormData({

                firstName: "",
                lastName: "",
                email: "",
                password: "",
                department_id: ""

            });
        }

        if (
            type === "edit-student"
        ) {

            setFormData({

                firstName:
                    item?.firstName || "",

                lastName:
                    item?.lastName || "",

                email:
                    item?.email || ""

            });
        }


        if (
            type === "create-enrollment"
        ) {

            setFormData({

                student_id: "",
                course_id: "",
                grade: ""

            });
        }


        if (
            type === "edit-enrollment"
        ) {

            setFormData({

                student_id:
                    item?.student_id ??
                    item?.studentId ??
                    item?.student?.student_id ??
                    "",

                course_id:
                    item?.course_id ??
                    item?.courseId ??
                    item?.course?.course_id ??
                    "",

                grade:
                    item?.grade || ""

            });
        }


        setModal(type);
    };


    const closeModal = () => {

        setModal(null);
        setSelectedItem(null);
        setFormData({});
    };


    const handleInputChange =
        event => {

            const {
                name,
                value
            } = event.target;


            setFormData(
                previous => ({
                    ...previous,
                    [name]: value
                })
            );
        };


    // ========================================================
    // STUDENT
    // ========================================================

    const createStudent =
        async event => {

            event.preventDefault();

            try {

                if (!formData.firstName?.trim()) {
                    showError("First name is required.");
                    return;
                }

                if (!formData.lastName?.trim()) {
                    showError("Last name is required.");
                    return;
                }

                if (!formData.email?.trim()) {
                    showError("Email is required.");
                    return;
                }

                if (!formData.password) {
                    showError("Password is required.");
                    return;
                }

                const payload = {

                    firstName:
                        formData.firstName.trim(),

                    lastName:
                        formData.lastName.trim(),

                    email:
                        formData.email.trim(),

                    password:
                        formData.password

                };


                if (formData.department_id) {

                    payload.department = {

                        department_id:
                            Number(
                                formData.department_id
                            )

                    };

                }


                await apiRequest(
                    "/student/admin/create",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Student created successfully."
                );


            } catch (err) {

                console.error(
                    "Create student error:",
                    err
                );

                showError(
                    err.message ||
                    "Failed to create student."
                );
            }
        };

    const updateStudent =
        async event => {

            event.preventDefault();


            try {

                const id =
                    getStudentId(
                        selectedItem
                    );


                await apiRequest(
                    `/student/update/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({
                                firstName:
                                    formData.firstName,

                                lastName:
                                    formData.lastName,

                                email:
                                    formData.email
                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Student updated successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const deleteStudent =
        async student => {

            const id =
                getStudentId(student);


            if (
                id === undefined ||
                id === null
            ) {

                showError(
                    "Student ID is missing."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete ${getStudentName(
                        student
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await apiRequest(
                    `/student/delete/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                // Optimistic UI update
                setStudents(
                    previous =>
                        previous.filter(
                            item =>
                                String(
                                    getStudentId(item)
                                ) !==
                                String(id)
                        )
                );


                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Student deleted successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    // ========================================================
    // PROFESSOR
    // ========================================================

    const createProfessor = async event => {
    event.preventDefault();

    try {
        if (!formData.firstName?.trim()) {
            showError("First name is required.");
            return;
        }

        if (!formData.lastName?.trim()) {
            showError("Last name is required.");
            return;
        }

        if (!formData.email?.trim()) {
            showError("Email is required.");
            return;
        }

        if (!formData.password) {
            showError("Password is required.");
            return;
        }

        const payload = {
            professor_name:
                `${formData.firstName.trim()} ${formData.lastName.trim()}`,

            email: formData.email.trim(),

            password: formData.password,

            role: "PROFESSOR"
        };

        console.log("Creating professor:", payload);

        await apiRequest("/professor/create", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        closeModal();

        await fetchDashboardData(true);

        showSuccess("Professor created successfully.");

    } catch (err) {
        console.error("Create professor error:", err);
        showError(err.message || "Failed to create professor.");
    }
};
    const updateProfessor =
        async event => {

            event.preventDefault();


            try {

                const id =
                    getProfessorId(
                        selectedItem
                    );


                await apiRequest(
                    `/professor/update/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({

                                firstName:
                                    formData.firstName,

                                lastName:
                                    formData.lastName,

                                email:
                                    formData.email

                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Professor updated successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const deleteProfessor =
        async professor => {

            const id =
                getProfessorId(
                    professor
                );


            if (
                id === undefined ||
                id === null
            ) {

                showError(
                    "Professor ID is missing."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete ${getProfessorName(
                        professor
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await apiRequest(
                    `/professor/delete/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Professor deleted successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    // ========================================================
    // COURSE
    // ========================================================

    const createCourse = async (event) => {
        event.preventDefault();

        try {
            await COURSE_API.post(
                "/courses/create",
                {
                    course_name: formData.course_name,
                    description: formData.description,
                    credits:
                        formData.credits === ""
                            ? null
                            : Number(formData.credits),

                    department_id:
                        formData.department_id === ""
                            ? null
                            : Number(formData.department_id),

                    professor_id:
                        formData.professor_id === ""
                            ? null
                            : Number(formData.professor_id)
                }
            );

            closeModal();

            await fetchDashboardData(true);

            showSuccess("Course created successfully.");

        } catch (err) {
            console.error("Create course error:", err);

            if (err.response?.status === 403) {
                showError(
                    "You do not have permission to create courses."
                );
            } else {
                showError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to create course."
                );
            }
        }
    };
    const updateCourse =
        async event => {

            event.preventDefault();


            try {

                const id =
                    getCourseId(
                        selectedItem
                    );


                await apiRequest(
                    `/courses/update/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({

                                course_name:
                                    formData.course_name,

                                description:
                                    formData.description,

                                credits:
                                    formData.credits === ""
                                        ? null
                                        : Number(
                                            formData.credits
                                        ),

                                department_id:
                                    formData.department_id === ""
                                        ? null
                                        : Number(
                                            formData.department_id
                                        ),

                                professor_id:
                                    formData.professor_id === ""
                                        ? null
                                        : Number(
                                            formData.professor_id
                                        )

                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Course updated successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const deleteCourse = async (course) => {

        const id = getCourseId(course);

        if (id === undefined || id === null) {
            showError("Course ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${getCourseName(course)}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await COURSE_API.delete(
                `/courses/delete/${id}`
            );

            await fetchDashboardData(true);

            showSuccess("Course deleted successfully.");

        } catch (err) {

            console.error("Delete course error:", err);

            if (err.response?.status === 403) {

                showError(
                    "You do not have permission to delete courses."
                );

            } else if (err.response?.status === 409) {

                showError(
                    err.response?.data?.message ||
                    "Cannot delete this course because students are enrolled in it."
                );

            } else if (err.response?.status === 404) {

                showError(
                    err.response?.data?.message ||
                    "Course not found."
                );

            } else {

                showError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Failed to delete course."
                );
            }
        }
    };


    // ========================================================
    // DEPARTMENT
    // ========================================================

    const createDepartment =
        async event => {

            event.preventDefault();


            try {

                await apiRequest(
                    "/api/department/create",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({

                                department_name:
                                    formData.department_name,

                                description:
                                    formData.description

                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Department created successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const updateDepartment =
        async event => {

            event.preventDefault();


            try {

                const id =
                    getDepartmentId(
                        selectedItem
                    );


                await apiRequest(
                    `/api/department/update/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({

                                department_name:
                                    formData.department_name,

                                description:
                                    formData.description

                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Department updated successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const deleteDepartment =
        async department => {

            const id =
                getDepartmentId(
                    department
                );


            if (
                id === undefined ||
                id === null
            ) {

                showError(
                    "Department ID is missing."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete ${getDepartmentName(
                        department
                    )}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await apiRequest(
                    `/api/department/delete/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Department deleted successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    // ========================================================
    // ENROLLMENTS
    // ========================================================

    const createEnrollment =
        async event => {

            event.preventDefault();


            try {

                if (
                    !formData.student_id ||
                    !formData.course_id
                ) {

                    showError(
                        "Please select a student and course."
                    );

                    return;
                }


                const studentId = Number(formData.student_id);
                const courseId = Number(formData.course_id);

                const alreadyEnrolled = enrollments.some(enrollment => {
                    const existingStudentId =
                        enrollment?.student_id ??
                        enrollment?.studentId ??
                        enrollment?.student?.student_id;

                    const existingCourseId =
                        enrollment?.course_id ??
                        enrollment?.courseId ??
                        enrollment?.course?.course_id;

                    return (
                        String(existingStudentId) === String(studentId) &&
                        String(existingCourseId) === String(courseId)
                    );
                });

                if (alreadyEnrolled) {
                    showError(
                        "This student is already enrolled in the selected course."
                    );
                    return;
                }

                await apiRequest(
                    "/api/createEnrollments",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                student_id: studentId,
                                course_id: courseId,
                                grade: formData.grade || null
                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Enrollment created successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const updateEnrollment =
        async event => {

            event.preventDefault();


            try {

                const id =
                    getEnrollmentId(
                        selectedItem
                    );


                await apiRequest(
                    `/api/update/${id}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify({

                                student_id:
                                    Number(
                                        formData.student_id
                                    ),

                                course_id:
                                    Number(
                                        formData.course_id
                                    ),

                                grade:
                                    formData.grade ||
                                    null

                            })
                    }
                );


                closeModal();

                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Enrollment updated successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    const deleteEnrollment =
        async enrollment => {

            const id =
                getEnrollmentId(
                    enrollment
                );


            if (
                id === undefined ||
                id === null
            ) {

                showError(
                    "Enrollment ID is missing."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete enrollment #${id}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await apiRequest(
                    `/api/delete/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                await fetchDashboardData(
                    true
                );


                showSuccess(
                    "Enrollment deleted successfully."
                );

            } catch (err) {

                showError(
                    err.message
                );
            }
        };


    // ========================================================
    // NAVIGATION
    // ========================================================

    const changeSection =
        section => {

            setActiveSection(
                section
            );

            setError("");
            setSuccess("");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="admin-loading">

                <div className="admin-spinner" />

                <h2>
                    Loading Admin Dashboard...
                </h2>

                <p>
                    Fetching academic data...
                </p>

                <style>
                    {adminStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="admin-page">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="admin-sidebar">

                <div className="admin-logo">

                    <div className="logo-icon">
                        S
                    </div>

                    <div>

                        <h2>
                            SIMS
                        </h2>

                        <span>
                            Administration
                        </span>

                    </div>

                </div>


                <nav className="admin-nav">

                    <button
                        className={
                            activeSection === "overview"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "overview"
                            )
                        }
                    >
                        📊 Dashboard
                    </button>


                    <button
                        className={
                            activeSection === "students"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "students"
                            )
                        }
                    >
                        👨‍🎓 Students
                    </button>


                    <button
                        className={
                            activeSection === "professors"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "professors"
                            )
                        }
                    >
                        👨‍🏫 Professors
                    </button>


                    <button
                        className={
                            activeSection === "courses"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "courses"
                            )
                        }
                    >
                        📚 Courses
                    </button>


                    <button
                        className={
                            activeSection === "departments"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "departments"
                            )
                        }
                    >
                        🏢 Departments
                    </button>


                    <button
                        className={
                            activeSection === "enrollments"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeSection(
                                "enrollments"
                            )
                        }
                    >
                        📝 Enrollments
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className="refresh-sidebar"
                        onClick={() =>
                            fetchDashboardData(
                                true
                            )
                        }
                    >
                        🔄 Refresh Data
                    </button>


                    <button
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="admin-main">


                {/* HEADER */}

                <header className="admin-header">

                    <div>

                        <p className="eyebrow">
                            ADMINISTRATOR CONTROL CENTER
                        </p>

                        <h1>

                            {activeSection === "overview" &&
                                "Dashboard Overview"}

                            {activeSection === "students" &&
                                "Student Management"}

                            {activeSection === "professors" &&
                                "Professor Management"}

                            {activeSection === "courses" &&
                                "Course Management"}

                            {activeSection === "departments" &&
                                "Department Management"}

                            {activeSection === "enrollments" &&
                                "Enrollment Management"}

                        </h1>

                    </div>


                    <div className="admin-header-actions">

                        <button
                            className="refresh-button"
                            onClick={() =>
                                fetchDashboardData(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>


                        <div className="admin-user">

                            <div className="admin-avatar">
                                A
                            </div>

                            <div>

                                <strong>
                                    Administrator
                                </strong>

                                <small>
                                    ADMIN
                                </small>

                            </div>

                        </div>

                    </div>

                </header>


                {/* ALERTS */}

                {error && (

                    <div className="alert error-alert">

                        <span>
                            ⚠️
                        </span>

                        <div>

                            <strong>
                                Action failed
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {success && (

                    <div className="alert success-alert">

                        <span>
                            ✓
                        </span>

                        <div>

                            <strong>
                                Success
                            </strong>

                            <p>
                                {success}
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* ==================================================
                    OVERVIEW
                ================================================== */}

                {activeSection === "overview" && (

                    <>

                        <section className="welcome-banner">

                            <div>

                                <span className="welcome-label">
                                    SYSTEM ADMINISTRATION
                                </span>

                                <h2>
                                    Welcome to the Admin
                                    Control Center
                                </h2>

                                <p>
                                    Manage students,
                                    professors,
                                    courses,
                                    departments and
                                    enrollments from one
                                    place.
                                </p>

                            </div>

                            <div className="welcome-icon">
                                ⚙️
                            </div>

                        </section>


                        <section className="stats-grid">

                            <StatCard
                                icon="👨‍🎓"
                                title="Total Students"
                                value={students.length}
                                onClick={() =>
                                    changeSection(
                                        "students"
                                    )
                                }
                            />

                            <StatCard
                                icon="👨‍🏫"
                                title="Total Professors"
                                value={professors.length}
                                onClick={() =>
                                    changeSection(
                                        "professors"
                                    )
                                }
                            />

                            <StatCard
                                icon="📚"
                                title="Total Courses"
                                value={courses.length}
                                onClick={() =>
                                    changeSection(
                                        "courses"
                                    )
                                }
                            />

                            <StatCard
                                icon="🏢"
                                title="Departments"
                                value={departments.length}
                                onClick={() =>
                                    changeSection(
                                        "departments"
                                    )
                                }
                            />

                            <StatCard
                                icon="📝"
                                title="Enrollments"
                                value={enrollments.length}
                                onClick={() =>
                                    changeSection(
                                        "enrollments"
                                    )
                                }
                            />

                        </section>


                        <section className="content-section">

                            <div className="section-heading">

                                <div>

                                    <span className="section-label">
                                        QUICK ACTIONS
                                    </span>

                                    <h2>
                                        Administrative Operations
                                    </h2>

                                </div>

                            </div>


                            <div className="quick-actions">

                                <QuickAction
                                    icon="👨‍🎓"
                                    title="Manage Students"
                                    description="View, search, edit and delete students"
                                    onClick={() =>
                                        changeSection(
                                            "students"
                                        )
                                    }
                                />

                                <QuickAction
                                    icon="👨‍🏫"
                                    title="Add Professor"
                                    description="Create a new professor account"
                                    onClick={() =>
                                        openModal(
                                            "add-professor"
                                        )
                                    }
                                />

                                <QuickAction
                                    icon="📚"
                                    title="Add Course"
                                    description="Create a new academic course"
                                    onClick={() =>
                                        openModal(
                                            "add-course"
                                        )
                                    }
                                />

                                <QuickAction
                                    icon="🏢"
                                    title="Add Department"
                                    description="Create a new academic department"
                                    onClick={() =>
                                        openModal(
                                            "add-department"
                                        )
                                    }
                                />

                                <QuickAction
                                    icon="📝"
                                    title="Create Enrollment"
                                    description="Enroll a student in a course"
                                    onClick={() =>
                                        openModal(
                                            "create-enrollment"
                                        )
                                    }
                                />

                            </div>

                        </section>

                    </>
                )}


                {/* ==================================================
                    STUDENTS
                ================================================== */}

                {activeSection === "students" && (

                    <ManagementSection
                        label="STUDENT RECORDS"
                        title="All Students"
                        count={filteredStudents.length}
                        search={studentSearch}
                        setSearch={setStudentSearch}
                        placeholder="Search students..."
                        addButton="Create Student"
                        onAdd={() => openModal("create-student")}
                    >
                        {filteredStudents.length === 0 ? (

                            <EmptyState
                                message="No students found."
                            />

                        ) : (

                            <Table>

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredStudents.map(
                                        student => (

                                            <tr
                                                key={
                                                    getStudentId(
                                                        student
                                                    )
                                                }
                                            >

                                                <td>
                                                    <span className="id-badge">
                                                        #
                                                        {
                                                            getStudentId(
                                                                student
                                                            )
                                                        }
                                                    </span>
                                                </td>


                                                <td>
                                                    <strong>
                                                        {
                                                            getStudentName(
                                                                student
                                                            )
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {
                                                        student.email ||
                                                        "—"
                                                    }
                                                </td>


                                                <td>
                                                    <span className="role-badge">
                                                        {
                                                            student.role ||
                                                            "STUDENT"
                                                        }
                                                    </span>
                                                </td>


                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openModal(
                                                                    "edit-student",
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                deleteStudent(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </Table>

                        )}

                    </ManagementSection>
                )}


                {/* ==================================================
                    PROFESSORS
                ================================================== */}

                {activeSection === "professors" && (

                    <ManagementSection
                        label="FACULTY RECORDS"
                        title="All Professors"
                        count={filteredProfessors.length}
                        search={professorSearch}
                        setSearch={setProfessorSearch}
                        placeholder="Search professors..."
                        addButton="Add Professor"
                        onAdd={() =>
                            openModal(
                                "add-professor"
                            )
                        }
                    >

                        {filteredProfessors.length === 0 ? (

                            <EmptyState
                                message="No professors found."
                            />

                        ) : (

                            <Table>

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Professor</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredProfessors.map(
                                        professor => (

                                            <tr
                                                key={
                                                    getProfessorId(
                                                        professor
                                                    )
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        getProfessorId(
                                                            professor
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        getProfessorName(
                                                            professor
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        professor.email ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    <span className="role-badge">
                                                        {
                                                            professor.role ||
                                                            "PROFESSOR"
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openModal(
                                                                    "edit-professor",
                                                                    professor
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                deleteProfessor(
                                                                    professor
                                                                )
                                                            }
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </Table>

                        )}

                    </ManagementSection>
                )}


                {/* ==================================================
                    COURSES
                ================================================== */}

                {activeSection === "courses" && (

                    <ManagementSection
                        label="COURSE CATALOG"
                        title="All Courses"
                        count={filteredCourses.length}
                        search={courseSearch}
                        setSearch={setCourseSearch}
                        placeholder="Search courses..."
                        addButton="Add Course"
                        onAdd={() =>
                            openModal(
                                "add-course"
                            )
                        }
                    >

                        {filteredCourses.length === 0 ? (

                            <EmptyState
                                message="No courses found."
                            />

                        ) : (

                            <Table>

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Course</th>
                                        <th>Credits</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredCourses.map(
                                        course => (

                                            <tr
                                                key={
                                                    getCourseId(
                                                        course
                                                    )
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        getCourseId(
                                                            course
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            getCourseName(
                                                                course
                                                            )
                                                        }
                                                    </strong>

                                                    {course.description && (
                                                        <small className="table-description">
                                                            {
                                                                course.description
                                                            }
                                                        </small>
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        course.credits ??
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openModal(
                                                                    "edit-course",
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                deleteCourse(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </Table>

                        )}

                    </ManagementSection>
                )}


                {/* ==================================================
                    DEPARTMENTS
                ================================================== */}

                {activeSection === "departments" && (

                    <ManagementSection
                        label="ACADEMIC STRUCTURE"
                        title="All Departments"
                        count={filteredDepartments.length}
                        search={departmentSearch}
                        setSearch={setDepartmentSearch}
                        placeholder="Search departments..."
                        addButton="Add Department"
                        onAdd={() =>
                            openModal(
                                "add-department"
                            )
                        }
                    >

                        {filteredDepartments.length === 0 ? (

                            <EmptyState
                                message="No departments found."
                            />

                        ) : (

                            <Table>

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Department</th>
                                        <th>Description</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredDepartments.map(
                                        department => (

                                            <tr
                                                key={
                                                    getDepartmentId(
                                                        department
                                                    )
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        getDepartmentId(
                                                            department
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            getDepartmentName(
                                                                department
                                                            )
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        department.description ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openModal(
                                                                    "edit-department",
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                deleteDepartment(
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </Table>

                        )}

                    </ManagementSection>
                )}


                {/* ==================================================
                    ENROLLMENTS
                ================================================== */}

                {activeSection === "enrollments" && (

                    <ManagementSection
                        label="ENROLLMENT RECORDS"
                        title="All Enrollments"
                        count={filteredEnrollments.length}
                        search={enrollmentSearch}
                        setSearch={setEnrollmentSearch}
                        placeholder="Search enrollments..."
                        addButton="Create Enrollment"
                        onAdd={() =>
                            openModal(
                                "create-enrollment"
                            )
                        }
                    >

                        {filteredEnrollments.length === 0 ? (

                            <EmptyState
                                message="No enrollments found."
                            />

                        ) : (

                            <Table>

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Grade</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredEnrollments.map(
                                        enrollment => (

                                            <tr
                                                key={
                                                    getEnrollmentId(
                                                        enrollment
                                                    )
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        getEnrollmentId(
                                                            enrollment
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getEnrollmentStudent(
                                                            enrollment
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        getEnrollmentCourse(
                                                            enrollment
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    <span className="grade-badge">
                                                        {
                                                            enrollment.grade ||
                                                            "Pending"
                                                        }
                                                    </span>
                                                </td>


                                                <td>
                                                    {
                                                        enrollment.enrollment_date ||
                                                        "—"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            enrollment.status?.toLowerCase() ===
                                                                "active"
                                                                ? "status-badge active-status"
                                                                : "status-badge inactive-status"
                                                        }
                                                    >
                                                        {
                                                            enrollment.status ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openModal(
                                                                    "edit-enrollment",
                                                                    enrollment
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                deleteEnrollment(
                                                                    enrollment
                                                                )
                                                            }
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </Table>

                        )}

                    </ManagementSection>
                )}

            </main>


            {/* ==================================================
                MODALS
            ================================================== */}

            {modal && (

                <div
                    className="modal-overlay"
                    onMouseDown={
                        closeModal
                    }
                >

                    <div
                        className="modal-card"
                        onMouseDown={
                            event =>
                                event.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <span className="section-label">
                                    ADMINISTRATION
                                </span>

                                <h2>

                                    {modal === "add-professor" &&
                                        "Add Professor"}

                                    {modal === "edit-professor" &&
                                        "Edit Professor"}

                                    {modal === "add-course" &&
                                        "Add Course"}

                                    {modal === "edit-course" &&
                                        "Edit Course"}

                                    {modal === "add-department" &&
                                        "Add Department"}

                                    {modal === "edit-department" &&
                                        "Edit Department"}

                                    {modal === "edit-student" &&
                                        "Edit Student"}

                                    {modal === "create-enrollment" &&
                                        "Create Enrollment"}

                                    {modal === "edit-enrollment" &&
                                        "Edit Enrollment"}

                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                            PROFESSOR FORM
                        ================================================= */}

                        {(modal === "add-professor" ||
                            modal === "edit-professor") && (

                                <form
                                    onSubmit={
                                        modal === "add-professor"
                                            ? createProfessor
                                            : updateProfessor
                                    }
                                >

                                    <div className="form-grid">

                                        <FormInput
                                            label="First Name"
                                            name="firstName"
                                            value={
                                                formData.firstName
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />


                                        <FormInput
                                            label="Last Name"
                                            name="lastName"
                                            value={
                                                formData.lastName
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <FormInput
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />


                                    {modal === "add-professor" && (

                                        <>

                                            <FormInput
                                                label="Password"
                                                type="password"
                                                name="password"
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                required
                                                minLength={6}
                                            />


                                            <div className="form-group">

                                                <label>
                                                    Role
                                                </label>

                                                <select
                                                    name="role"
                                                    value={
                                                        formData.role ||
                                                        "PROFESSOR"
                                                    }
                                                    onChange={
                                                        handleInputChange
                                                    }
                                                >

                                                    <option value="PROFESSOR">
                                                        PROFESSOR
                                                    </option>

                                                    <option value="ROLE_PROFESSOR">
                                                        ROLE_PROFESSOR
                                                    </option>

                                                </select>

                                            </div>

                                        </>
                                    )}


                                    <ModalButtons
                                        onCancel={
                                            closeModal
                                        }
                                    />

                                </form>
                            )}


                        {/* =================================================
                            COURSE FORM
                        ================================================= */}

                        {(modal === "add-course" ||
                            modal === "edit-course") && (

                                <form
                                    onSubmit={
                                        modal === "add-course"
                                            ? createCourse
                                            : updateCourse
                                    }
                                >

                                    <FormInput
                                        label="Course Name"
                                        name="course_name"
                                        value={
                                            formData.course_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />


                                    <div className="form-group">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows="3"
                                        />

                                    </div>


                                    <FormInput
                                        label="Credits"
                                        type="number"
                                        name="credits"
                                        value={
                                            formData.credits
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        min="1"
                                        max="10"
                                    />


                                    <div className="form-group">

                                        <label>
                                            Department
                                        </label>

                                        <select
                                            name="department_id"
                                            value={
                                                formData.department_id ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >

                                            <option value="">
                                                Select department
                                            </option>

                                            {departments.map(
                                                department => (

                                                    <option
                                                        key={
                                                            getDepartmentId(
                                                                department
                                                            )
                                                        }
                                                        value={
                                                            getDepartmentId(
                                                                department
                                                            )
                                                        }
                                                    >
                                                        {
                                                            getDepartmentName(
                                                                department
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Professor
                                        </label>

                                        <select
                                            name="professor_id"
                                            value={
                                                formData.professor_id ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >

                                            <option value="">
                                                Select professor
                                            </option>

                                            {professors.map(
                                                professor => (

                                                    <option
                                                        key={
                                                            getProfessorId(
                                                                professor
                                                            )
                                                        }
                                                        value={
                                                            getProfessorId(
                                                                professor
                                                            )
                                                        }
                                                    >
                                                        {
                                                            getProfessorName(
                                                                professor
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <ModalButtons
                                        onCancel={
                                            closeModal
                                        }
                                    />

                                </form>
                            )}


                        {/* =================================================
                            DEPARTMENT FORM
                        ================================================= */}

                        {(modal === "add-department" ||
                            modal === "edit-department") && (

                                <form
                                    onSubmit={
                                        modal === "add-department"
                                            ? createDepartment
                                            : updateDepartment
                                    }
                                >

                                    <FormInput
                                        label="Department Name"
                                        name="department_name"
                                        value={
                                            formData.department_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />


                                    <div className="form-group">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows="4"
                                        />

                                    </div>


                                    <ModalButtons
                                        onCancel={
                                            closeModal
                                        }
                                    />

                                </form>
                            )}


                        {/* =================================================
                            STUDENT FORM
                        ================================================= */}

                        {modal === "edit-student" && (

                            <form
                                onSubmit={
                                    updateStudent
                                }
                            >

                                <FormInput
                                    label="First Name"
                                    name="firstName"
                                    value={
                                        formData.firstName
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <FormInput
                                    label="Last Name"
                                    name="lastName"
                                    value={
                                        formData.lastName
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <FormInput
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <ModalButtons
                                    onCancel={
                                        closeModal
                                    }
                                />

                            </form>
                        )}
                        {/* =================================================
    CREATE STUDENT FORM
================================================= */}

                        {modal === "create-student" && (

                            <form
                                onSubmit={
                                    createStudent
                                }
                            >

                                <FormInput
                                    label="First Name"
                                    name="firstName"
                                    value={
                                        formData.firstName || ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <FormInput
                                    label="Last Name"
                                    name="lastName"
                                    value={
                                        formData.lastName || ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <FormInput
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email || ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <FormInput
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={
                                        formData.password || ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />


                                <div className="form-group">

                                    <label>
                                        Department
                                    </label>

                                    <select
                                        name="department_id"
                                        value={
                                            formData.department_id || ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    >

                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            department => (

                                                <option
                                                    key={
                                                        department.department_id
                                                    }
                                                    value={
                                                        department.department_id
                                                    }
                                                >
                                                    {
                                                        department.department_name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <ModalButtons
                                    onCancel={
                                        closeModal
                                    }
                                />

                            </form>
                        )}

                        {/* =================================================
                            ENROLLMENT FORM
                        ================================================= */}

                        {(modal === "create-enrollment" ||
                            modal === "edit-enrollment") && (

                                <form
                                    className="enrollment-form"
                                    onSubmit={
                                        modal === "create-enrollment"
                                            ? createEnrollment
                                            : updateEnrollment
                                    }
                                >

                                    {modal === "create-enrollment" && (
                                        <div className="enrollment-intro">
                                            <div className="enrollment-intro-icon">
                                                📝
                                            </div>
                                            <div>
                                                <strong>Enroll a student in a course</strong>
                                                <p>
                                                    Select the student and course below. The enrollment date and
                                                    active status will be assigned automatically by the backend.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="enrollment-student">
                                            Student <span className="required-mark">*</span>
                                        </label>

                                        <select
                                            id="enrollment-student"
                                            name="student_id"
                                            value={formData.student_id || ""}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">
                                                Select a student
                                            </option>

                                            {students.map(student => (
                                                <option
                                                    key={getStudentId(student)}
                                                    value={getStudentId(student)}
                                                >
                                                    {getStudentName(student)} — #{getStudentId(student)}
                                                </option>
                                            ))}
                                        </select>

                                        {students.length === 0 && (
                                            <small className="form-help error-help">
                                                No students are currently available.
                                            </small>
                                        )}
                                    </div>


                                    <div className="form-group">
                                        <label htmlFor="enrollment-course">
                                            Course <span className="required-mark">*</span>
                                        </label>

                                        <select
                                            id="enrollment-course"
                                            name="course_id"
                                            value={formData.course_id || ""}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">
                                                Select a course
                                            </option>

                                            {courses.map(course => (
                                                <option
                                                    key={getCourseId(course)}
                                                    value={getCourseId(course)}
                                                >
                                                    {getCourseName(course)} — #{getCourseId(course)}
                                                    {course?.credits !== undefined &&
                                                        course?.credits !== null
                                                        ? ` (${course.credits} credits)`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>

                                        {courses.length === 0 && (
                                            <small className="form-help error-help">
                                                No courses are currently available.
                                            </small>
                                        )}
                                    </div>


                                    {modal === "create-enrollment" && (
                                        <div className="enrollment-summary">
                                            <div className="summary-title">
                                                Enrollment Summary
                                            </div>

                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span>Student</span>
                                                    <strong>
                                                        {formData.student_id
                                                            ? (() => {
                                                                const student = students.find(
                                                                    item =>
                                                                        String(getStudentId(item)) ===
                                                                        String(formData.student_id)
                                                                );
                                                                return student
                                                                    ? getStudentName(student)
                                                                    : "Selected student";
                                                            })()
                                                            : "Not selected"}
                                                    </strong>
                                                </div>

                                                <div className="summary-item">
                                                    <span>Course</span>
                                                    <strong>
                                                        {formData.course_id
                                                            ? (() => {
                                                                const course = courses.find(
                                                                    item =>
                                                                        String(getCourseId(item)) ===
                                                                        String(formData.course_id)
                                                                );
                                                                return course
                                                                    ? getCourseName(course)
                                                                    : "Selected course";
                                                            })()
                                                            : "Not selected"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                    <div className="form-group">
                                        <label htmlFor="enrollment-grade">
                                            Grade
                                        </label>

                                        <select
                                            id="enrollment-grade"
                                            name="grade"
                                            value={formData.grade || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">
                                                Not graded yet
                                            </option>
                                            <option value="A">A</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B">B</option>
                                            <option value="B-">B-</option>
                                            <option value="C+">C+</option>
                                            <option value="C">C</option>
                                            <option value="C-">C-</option>
                                            <option value="D">D</option>
                                            <option value="F">F</option>
                                        </select>

                                        <small className="form-help">
                                            Leave this as “Not graded yet” for a newly enrolled student.
                                        </small>
                                    </div>


                                    <div className="modal-buttons enrollment-modal-buttons">
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="save-button enrollment-save-button"
                                            disabled={
                                                !formData.student_id ||
                                                !formData.course_id ||
                                                students.length === 0 ||
                                                courses.length === 0
                                            }
                                        >
                                            {modal === "create-enrollment"
                                                ? "Create Enrollment"
                                                : "Save Changes"}
                                        </button>
                                    </div>

                                </form>
                            )}

                    </div>

                </div>
            )}


            <style>
                {adminStyles}
            </style>

        </div>
    );
};


// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const StatCard = ({
    icon,
    title,
    value,
    onClick
}) => (

    <button
        className="stat-card"
        onClick={onClick}
    >

        <div className="stat-icon">
            {icon}
        </div>

        <div>

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

            <small>
                Manage →
            </small>

        </div>

    </button>
);


const QuickAction = ({
    icon,
    title,
    description,
    onClick
}) => (

    <button
        className="quick-action"
        onClick={onClick}
    >

        <span className="quick-icon">
            {icon}
        </span>

        <div>

            <strong>
                {title}
            </strong>

            <small>
                {description}
            </small>

        </div>

        <b>
            →
        </b>

    </button>
);


const ManagementSection = ({
    label,
    title,
    count,
    search,
    setSearch,
    placeholder,
    addButton,
    onAdd,
    children
}) => (

    <section className="management-section">

        <div className="management-toolbar">

            <div>

                <span className="section-label">
                    {label}
                </span>

                <h2>
                    {title}
                </h2>

                <p>
                    {count} records
                </p>

            </div>


            <div className="toolbar-actions">

                <div className="search-box">

                    🔍

                    <input
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder={
                            placeholder
                        }
                    />

                </div>


                {addButton && (

                    <button
                        className="primary-button"
                        onClick={onAdd}
                    >
                        + {addButton}
                    </button>

                )}

            </div>

        </div>


        <div className="table-card">

            {children}

        </div>

    </section>
);


const Table = ({
    children
}) => (

    <div className="table-wrapper">

        <table>
            {children}
        </table>

    </div>
);


const EmptyState = ({
    message
}) => (

    <div className="empty-state">

        <div className="empty-icon">
            📭
        </div>

        <h3>
            {message}
        </h3>

        <p>
            Try changing your search or refresh the data.
        </p>

    </div>
);


const FormInput = ({
    label,
    ...props
}) => (

    <div className="form-group">

        <label>
            {label}
        </label>

        <input
            {...props}
        />

    </div>
);


const ModalButtons = ({
    onCancel,
    saveLabel = "Save Changes"
}) => (

    <div className="modal-buttons">

        <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
        >
            Cancel
        </button>

        <button
            type="submit"
            className="save-button"
        >
            {saveLabel}
        </button>

    </div>
);


// ============================================================
// CSS
// ============================================================

const adminStyles = `

* {
    box-sizing: border-box;
}


body {
    margin: 0;
    font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;
}


.admin-page {
    min-height: 100vh;
    display: flex;
    background: #f5f7fb;
    color: #1f2937;
}


/* ==========================================================
   SIDEBAR
========================================================== */

.admin-sidebar {
    width: 255px;
    min-height: 100vh;

    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;

    background: #111827;
    color: white;

    padding: 25px 18px;

    display: flex;
    flex-direction: column;

    z-index: 20;
}


.admin-logo {
    display: flex;
    align-items: center;
    gap: 12px;

    padding:
        5px
        8px
        30px;

    border-bottom:
        1px solid
        rgba(255,255,255,.1);
}


.logo-icon {
    width: 42px;
    height: 42px;

    border-radius: 12px;

    background: #2563eb;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 800;
    font-size: 21px;
}


.admin-logo h2 {
    margin: 0;
}


.admin-logo span {
    font-size: 12px;
    opacity: .65;
}


.admin-nav {
    margin-top: 25px;

    display: flex;
    flex-direction: column;
    gap: 7px;
}


.admin-nav button {
    width: 100%;

    border: 0;
    background: transparent;

    color: #cbd5e1;

    padding:
        13px
        14px;

    border-radius: 9px;

    text-align: left;

    font-size: 14px;

    cursor: pointer;
}


.admin-nav button:hover,
.admin-nav button.active {
    background: #1e293b;
    color: white;
}


.sidebar-bottom {
    margin-top: auto;

    display: flex;
    flex-direction: column;

    gap: 10px;
}


.refresh-sidebar,
.logout-button {
    border: 0;

    padding: 12px;

    border-radius: 8px;

    cursor: pointer;

    font-weight: 600;
}


.refresh-sidebar {
    background: #1e293b;
    color: white;
}


.logout-button {
    background: #dc2626;
    color: white;
}


/* ==========================================================
   MAIN
========================================================== */

.admin-main {
    margin-left: 255px;

    width: calc(100% - 255px);

    padding:
        30px
        35px;
}


.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 25px;
}


.eyebrow {
    margin: 0 0 5px;

    font-size: 11px;

    font-weight: 800;

    letter-spacing: 1.2px;

    color: #64748b;
}


.admin-header h1 {
    margin: 0;

    font-size: 30px;
}


.admin-header-actions {
    display: flex;
    align-items: center;
    gap: 18px;
}


.refresh-button {
    border: 1px solid #d1d5db;

    background: white;

    padding:
        10px
        15px;

    border-radius: 8px;

    cursor: pointer;
}


.admin-user {
    display: flex;
    align-items: center;
    gap: 10px;
}


.admin-avatar {
    width: 40px;
    height: 40px;

    border-radius: 50%;

    background: #2563eb;

    color: white;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 700;
}


.admin-user strong,
.admin-user small {
    display: block;
}


.admin-user small {
    color: #64748b;
    margin-top: 2px;
}


/* ==========================================================
   ALERTS
========================================================== */

.alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    padding: 15px 18px;

    margin-bottom: 22px;

    border-radius: 10px;
}


.alert p {
    margin: 4px 0 0;
}


.alert button {
    margin-left: auto;

    border: 0;
    background: transparent;

    font-size: 20px;

    cursor: pointer;
}


.error-alert {
    background: #fee2e2;
    color: #991b1b;
}


.success-alert {
    background: #dcfce7;
    color: #166534;
}


/* ==========================================================
   WELCOME
========================================================== */

.welcome-banner {
    background: #111827;

    color: white;

    border-radius: 18px;

    padding: 35px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 25px;
}


.welcome-label,
.section-label {
    font-size: 11px;

    font-weight: 800;

    letter-spacing: 1px;

    color: #64748b;
}


.welcome-label {
    color: #93c5fd;
}


.welcome-banner h2 {
    font-size: 29px;

    margin:
        10px
        0;
}


.welcome-banner p {
    color: #cbd5e1;

    max-width: 600px;
}


.welcome-icon {
    font-size: 60px;
}


/* ==========================================================
   STATS
========================================================== */

.stats-grid {
    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(180px, 1fr)
        );

    gap: 16px;

    margin-bottom: 30px;
}


.stat-card {
    border: 0;

    background: white;

    padding: 22px;

    border-radius: 14px;

    box-shadow:
        0 2px 8px
        rgba(15,23,42,.06);

    display: flex;

    align-items: center;

    gap: 15px;

    text-align: left;

    cursor: pointer;
}


.stat-card:hover {
    transform: translateY(-2px);
}


.stat-icon {
    width: 48px;
    height: 48px;

    border-radius: 12px;

    background: #eff6ff;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 23px;
}


.stat-card span,
.stat-card strong,
.stat-card small {
    display: block;
}


.stat-card span {
    font-size: 13px;
    color: #64748b;
}


.stat-card strong {
    font-size: 26px;
    margin: 3px 0;
}


.stat-card small {
    color: #2563eb;
}


/* ==========================================================
   CONTENT
========================================================== */

.content-section {
    background: white;

    border-radius: 15px;

    padding: 25px;

    margin-bottom: 25px;
}


.section-heading h2 {
    margin:
        6px
        0
        20px;
}


.quick-actions {
    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(260px, 1fr)
        );

    gap: 12px;
}


.quick-action {
    display: flex;
    align-items: center;

    gap: 14px;

    padding: 16px;

    background: #f8fafc;

    border: 1px solid #e2e8f0;

    border-radius: 10px;

    text-align: left;

    cursor: pointer;
}


.quick-action:hover {
    background: #f1f5f9;
}


.quick-icon {
    font-size: 25px;
}


.quick-action strong,
.quick-action small {
    display: block;
}


.quick-action small {
    margin-top: 4px;
    color: #64748b;
}


.quick-action b {
    margin-left: auto;
}


/* ==========================================================
   MANAGEMENT
========================================================== */

.management-section {
    background: white;

    border-radius: 15px;

    padding: 25px;
}


.management-toolbar {
    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;

    margin-bottom: 22px;
}


.management-toolbar h2 {
    margin:
        5px
        0;
}


.management-toolbar p {
    margin: 0;
    color: #64748b;
}


.toolbar-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}


.search-box {
    display: flex;
    align-items: center;

    gap: 8px;

    background: #f8fafc;

    border:
        1px solid
        #e2e8f0;

    border-radius: 8px;

    padding:
        8px
        12px;
}


.search-box input {
    border: 0;

    outline: none;

    background: transparent;

    min-width: 220px;
}


.primary-button {
    border: 0;

    background: #2563eb;

    color: white;

    padding:
        10px
        15px;

    border-radius: 8px;

    cursor: pointer;

    font-weight: 600;
}


/* ==========================================================
   TABLE
========================================================== */

.table-card {
    overflow: hidden;

    border:
        1px solid
        #e5e7eb;

    border-radius: 10px;
}


.table-wrapper {
    overflow-x: auto;
}


table {
    width: 100%;

    border-collapse: collapse;
}


th {
    background: #f8fafc;

    color: #475569;

    font-size: 12px;

    text-transform: uppercase;

    letter-spacing: .4px;
}


th,
td {
    padding: 15px;

    border-bottom:
        1px solid
        #e5e7eb;

    text-align: left;

    white-space: nowrap;
}


tr:last-child td {
    border-bottom: 0;
}


.id-badge,
.role-badge,
.grade-badge,
.status-badge {
    display: inline-block;

    padding:
        5px
        9px;

    border-radius: 20px;

    font-size: 12px;

    font-weight: 700;
}


.id-badge {
    background: #f1f5f9;
}


.role-badge {
    background: #dbeafe;
    color: #1d4ed8;
}


.grade-badge {
    background: #fef3c7;
    color: #92400e;
}


.active-status {
    background: #dcfce7;
    color: #166534;
}


.inactive-status {
    background: #fee2e2;
    color: #991b1b;
}


.table-description {
    display: block;

    color: #64748b;

    margin-top: 4px;

    max-width: 400px;

    overflow: hidden;

    text-overflow: ellipsis;
}


/* ==========================================================
   ACTIONS
========================================================== */

.action-buttons {
    display: flex;
    gap: 7px;
}


.edit-button,
.delete-button {
    border: 0;

    padding:
        7px
        10px;

    border-radius: 7px;

    cursor: pointer;

    font-size: 12px;

    font-weight: 600;
}


.edit-button {
    background: #dbeafe;
    color: #1d4ed8;
}


.delete-button {
    background: #fee2e2;
    color: #b91c1c;
}


.edit-button:hover {
    background: #bfdbfe;
}


.delete-button:hover {
    background: #fecaca;
}


/* ==========================================================
   EMPTY
========================================================== */

.empty-state {
    text-align: center;

    padding: 55px 20px;
}


.empty-icon {
    font-size: 45px;
}


.empty-state h3 {
    margin:
        12px
        0
        5px;
}


.empty-state p {
    color: #64748b;
}


/* ==========================================================
   ENROLLMENT MODAL ENHANCEMENTS
========================================================== */

.enrollment-form {
    padding-top: 2px;
}

.enrollment-intro {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    margin-bottom: 22px;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff, #f8fbff);
}

.enrollment-intro-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: white;
    box-shadow: 0 2px 8px rgba(37,99,235,.10);
    font-size: 20px;
}

.enrollment-intro strong {
    display: block;
    color: #0f172a;
    font-size: 14px;
    margin-bottom: 4px;
}

.enrollment-intro p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
}

.required-mark {
    color: #dc2626;
}

.form-help {
    display: block;
    margin-top: 6px;
    color: #64748b;
    font-size: 11px;
    line-height: 1.4;
}

.error-help {
    color: #b91c1c;
}

.enrollment-summary {
    margin: 4px 0 20px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
}

.summary-title {
    margin-bottom: 12px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .5px;
    text-transform: uppercase;
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.summary-item {
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    background: white;
}

.summary-item span,
.summary-item strong {
    display: block;
}

.summary-item span {
    margin-bottom: 4px;
    color: #64748b;
    font-size: 11px;
}

.summary-item strong {
    overflow: hidden;
    color: #0f172a;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.enrollment-save-button:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
}

.enrollment-save-button:not(:disabled):hover {
    background: #1d4ed8;
}

.enrollment-modal-buttons {
    padding-top: 4px;
}


/* ==========================================================
   MODAL
========================================================== */

.modal-overlay {
    position: fixed;

    inset: 0;

    background:
        rgba(
            15,
            23,
            42,
            .65
        );

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

    z-index: 100;
}


.modal-card {
    background: white;

    width: 100%;

    max-width: 560px;

    max-height: 90vh;

    overflow-y: auto;

    border-radius: 15px;

    padding: 25px;

    box-shadow:
        0 20px 60px
        rgba(0,0,0,.25);
}


.modal-header {
    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    margin-bottom: 25px;
}


.modal-header h2 {
    margin:
        5px
        0
        0;
}


.modal-close {
    border: 0;

    background: transparent;

    font-size: 27px;

    cursor: pointer;
}


.form-grid {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 14px;
}


.form-group {
    margin-bottom: 16px;
}


.form-group label {
    display: block;

    margin-bottom: 6px;

    font-size: 13px;

    font-weight: 600;
}


.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;

    padding: 10px 11px;

    border:
        1px solid
        #d1d5db;

    border-radius: 8px;

    font-family: inherit;

    outline: none;
}


.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: #2563eb;
}


.modal-buttons {
    display: flex;

    justify-content: flex-end;

    gap: 10px;

    margin-top: 22px;
}


.cancel-button,
.save-button {
    border: 0;

    padding:
        10px
        16px;

    border-radius: 8px;

    cursor: pointer;

    font-weight: 600;
}


.cancel-button {
    background: #e5e7eb;
}


.save-button {
    background: #2563eb;

    color: white;
}


/* ==========================================================
   LOADING
========================================================== */

.admin-loading {
    min-height: 100vh;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    background: #f5f7fb;
}


.admin-spinner {
    width: 45px;
    height: 45px;

    border:
        4px solid
        #dbeafe;

    border-top-color:
        #2563eb;

    border-radius: 50%;

    animation:
        spin
        1s linear infinite;

    margin-bottom: 15px;
}


@keyframes spin {

    to {
        transform:
            rotate(360deg);
    }

}


/* ==========================================================
   RESPONSIVE
========================================================== */

@media (
    max-width: 900px
) {

    .admin-sidebar {
        width: 210px;
    }


    .admin-main {
        margin-left: 210px;

        width:
            calc(
                100% - 210px
            );

        padding: 20px;
    }


    .admin-header {
        flex-direction: column;

        align-items: flex-start;

        gap: 15px;
    }

}


@media (
    max-width: 700px
) {

    .admin-sidebar {
        position: relative;

        width: 100%;

        min-height: auto;
    }


    .admin-page {
        flex-direction: column;
    }


    .admin-main {
        margin-left: 0;

        width: 100%;
    }


    .admin-nav {
        display: grid;

        grid-template-columns:
            repeat(
                2,
                1fr
            );
    }


    .management-toolbar {
        flex-direction: column;

        align-items: stretch;
    }


    .toolbar-actions {
        flex-direction: column;
    }


    .search-box input {
        width: 100%;
        min-width: 0;
    }


    .form-grid {
        grid-template-columns: 1fr;
    }

}

`;


export default AdminDashboard;