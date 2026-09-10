import { useState } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "../services/api";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        console.log("1. Login button clicked");

        setError("");
        setLoading(true);

        try {

            console.log("2. Sending login request...");

            const response = await fetch(
                `${API_URL}/student/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            console.log(
                "3. Login response:",
                response.status
            );

            const data = await response.text();

            if (!response.ok) {

                console.error(
                    "Login failed:",
                    response.status,
                    data
                );

                setError(
                    "Invalid email or password"
                );

                return;
            }

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

            // Save JWT
            localStorage.setItem(
                "token",
                data
            );
            console.log(
                "5. JWT saved successfully"
            );

            // Decode JWT
            const payload = JSON.parse(
                atob(data.split(".")[1])
            );

            console.log(
                "6. JWT payload:",
                payload
            );

            // IMPORTANT:
            // Use a different variable name.
            const jwtRole = payload.role;

            console.log(
                "7. User role:",
                jwtRole
            );

            // Navigate according to JWT role
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

                <form onSubmit={handleLogin}>

                    <div>
                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter email"
                            required
                        />
                    </div>

                    <div>
                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
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
