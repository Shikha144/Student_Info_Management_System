import { useState } from "react";
import {
    useNavigate,
    useSearchParams
} from "react-router";
import { API_URL } from "../services/api";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const loginType =
        searchParams.get("type") || "student";

    const handleLogin = async (e) => {

        e.preventDefault();

        console.log("1. Login button clicked");
        console.log("Login type:", loginType);

        setError("");
        setLoading(true);

        try {

            // =================================================
            // SELECT LOGIN ENDPOINT
            // =================================================

            let loginEndpoint;

            if (loginType === "student") {

                loginEndpoint = "/student/login";

            } else if (loginType === "professor") {

                loginEndpoint = "/professor/login";

            } else if (loginType === "admin") {

                loginEndpoint = "/admins/login";

            } else {

                setError("Invalid login type.");
                return;
            }

            console.log(
                "2. Sending login request..."
            );

            console.log(
                "Login endpoint:",
                loginEndpoint
            );

            // =================================================
            // READ VALUES DIRECTLY FROM THE FORM
            // =================================================
            //
            // This is intentional.
            // Browser autofill/password managers can update
            // the input DOM value without React state always
            // receiving the same update.
            //
            // Reading the form fields here guarantees that the
            // value actually present in the input is submitted.
            // =================================================

            const form = e.currentTarget;

            const submittedEmail =
                form.elements.email.value.trim();

            const submittedPassword =
                form.elements.password.value;

            console.log(
                "Email being submitted:",
                submittedEmail
            );

            console.log(
                "Password length being submitted:",
                submittedPassword.length
            );

            // Keep React state synchronized as well
            setEmail(submittedEmail);
            setPassword(submittedPassword);

            // =================================================
            // LOGIN REQUEST
            // =================================================

            const response = await fetch(
                `${API_URL}${loginEndpoint}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: submittedEmail,
                        password: submittedPassword
                    })
                }
            );

            console.log(
                "3. Login response:",
                response.status
            );

            const data =
                await response.text();

            console.log(
                "Server response:",
                data
            );

            // =================================================
            // LOGIN FAILED
            // =================================================

            if (!response.ok) {

                console.error(
                    "Login failed:",
                    response.status,
                    data
                );

                setError(
                    data ||
                    "Invalid email or password."
                );

                return;
            }

            // =================================================
            // CHECK TOKEN
            // =================================================

            console.log(
                "4. Token received:",
                data ? "YES" : "NO"
            );

            if (!data) {

                setError(
                    "Server did not return a token."
                );

                return;
            }

            // =================================================
            // SAVE JWT
            // =================================================

            localStorage.setItem(
                "token",
                data
            );

            console.log(
                "5. JWT saved successfully"
            );

            // =================================================
            // DECODE JWT
            // =================================================

            const tokenParts =
                data.split(".");

            if (tokenParts.length !== 3) {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "Invalid token received from server."
                );

                return;
            }

            const payload =
                JSON.parse(
                    atob(tokenParts[1])
                );

            console.log(
                "6. JWT payload:",
                payload
            );

            const jwtRole =
                payload.role;

            console.log(
                "7. User role:",
                jwtRole
            );

            // =================================================
            // PORTAL / ROLE SECURITY CHECK
            // =================================================

            if (
                loginType === "student" &&
                jwtRole !== "ROLE_STUDENT"
            ) {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "This account is not authorized for student login."
                );

                return;
            }

            if (
                loginType === "professor" &&
                jwtRole !== "ROLE_PROFESSOR"
            ) {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "This account is not authorized for professor login."
                );

                return;
            }

            if (
                loginType === "admin" &&
                jwtRole !== "ROLE_ADMIN"
            ) {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "This account is not authorized for admin login."
                );

                return;
            }

            // =================================================
            // NAVIGATION
            // =================================================

            if (jwtRole === "ROLE_STUDENT") {

                console.log(
                    "8. Navigating to student dashboard"
                );

                navigate(
                    "/student-dashboard"
                );

            } else if (jwtRole === "ROLE_PROFESSOR") {

                console.log(
                    "8. Navigating to professor dashboard"
                );

                navigate(
                    "/professor-dashboard"
                );

            } else if (jwtRole === "ROLE_ADMIN") {

                console.log(
                    "8. Navigating to admin dashboard"
                );

                navigate(
                    "/admin-dashboard"
                );

            } else {

                console.error(
                    "Unknown role:",
                    jwtRole
                );

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "Unknown user role."
                );
            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                "Unable to connect to server."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>
                    SIMS Login
                </h1>

                <p>
                    Student Information Management System
                </p>

                <form
                    onSubmit={handleLogin}
                    autoComplete="off"
                >

                    <div>

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.currentTarget.value
                                )
                            }
                            placeholder="Enter email"
                            autoComplete="off"
                            required
                            disabled={loading}
                        />

                    </div>

                    <div>

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.currentTarget.value
                                )
                            }
                            placeholder="Enter password"
                            autoComplete="off"
                            required
                            disabled={loading}
                        />

                    </div>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;
