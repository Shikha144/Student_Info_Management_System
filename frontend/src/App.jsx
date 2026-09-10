import {
    Routes,
    Route,
    Navigate
} from "react-router";

import Home from "./components/Home";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import ProfessorDashboard from "./components/ProfessorDashBoard";
import AdminDashboard from "./components/AdminDashboard";
import StudentManagement from "./components/StudentManagement";
import ProfessorManagement from "./components/ProfessorManagement";
import CourseManagement from "./components/CourseManagement";
import DepartmentManagement from "./components/DepartmentManagement";

import {
    getToken,
    getRole
} from "./auth";


// ---------------------------------------
// PROTECTED ROUTE
// ---------------------------------------

function ProtectedRoute({ allowedRole, children }) {

    const token = getToken();
    const role = getRole();


    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    if (role !== allowedRole) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}


// ---------------------------------------
// APP
// ---------------------------------------

function App() {

    return (

        <Routes>


            {/* =================================
                HOME
            ================================= */}

            <Route
                path="/"
                element={
                    <Home />
                }
            />


            {/* =================================
                LOGIN
            ================================= */}

            <Route
                path="/login"
                element={
                    <Login />
                }
            />


            {/* =================================
                STUDENT DASHBOARD
            ================================= */}

            <Route
                path="/student-dashboard"
                element={

                    <ProtectedRoute
                        allowedRole="ROLE_STUDENT"
                    >

                        <StudentDashboard />

                    </ProtectedRoute>

                }
            />


            {/* =================================
                PROFESSOR DASHBOARD
            ================================= */}

            <Route
                path="/professor-dashboard"
                element={

                    <ProtectedRoute
                        allowedRole="ROLE_PROFESSOR"
                    >

                        <ProfessorDashboard />

                    </ProtectedRoute>

                }
            />


            {/* =================================
                ADMIN DASHBOARD
            ================================= */}

            <Route
                path="/admin-dashboard"
                element={

                    <ProtectedRoute
                        allowedRole="ROLE_ADMIN"
                    >

                        <AdminDashboard />

                    </ProtectedRoute>

                }
            />
            <Route
    path="/course-management"
    element={<CourseManagement />}
/>

<Route
    path="/department-management"
    element={<DepartmentManagement />}
/>


            {/* =================================
                STUDENT MANAGEMENT
                ADMIN ONLY
            ================================= */}

            <Route
                path="/student-management"
                element={

                    <ProtectedRoute
                        allowedRole="ROLE_ADMIN"
                    >

                        <StudentManagement />

                    </ProtectedRoute>

                }
            />
            <Route
                path="/professor-management"
                element={
                    <ProtectedRoute
                        allowedRole="ROLE_ADMIN"
                    >
                        <ProfessorManagement />
                    </ProtectedRoute>
                }
            />

            {/* =================================
                UNKNOWN URL
            ================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>

    );
}


export default App;
