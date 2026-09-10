import axios from "axios";

// ============================================================
// API BASE URL
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export { API_URL };
// ============================================================
// Course API
// ============================================================

export const COURSE_API = axios.create({
    baseURL: API_URL,
});

// Automatically attach JWT token to course requests
COURSE_API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// Fetch-based API helper
// Used by Admin Dashboard CRUD operations
// ============================================================

export const API_BASE = `${API_URL}/api`;

export const getToken = () => {
    return localStorage.getItem("token");
};

export const apiRequest = async (endpoint, options = {}) => {

    const token = getToken();

    if (!token) {
        throw new Error("Authentication token not found.");
    }

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(options.headers || {}),

                Authorization: `Bearer ${token}`,
            },
        }
    );

    // ========================================================
    // Authentication errors
    // ========================================================

    if (response.status === 401) {

        localStorage.removeItem("token");

        throw new Error(
            "Your session has expired. Please log in again."
        );
    }

    if (response.status === 403) {

        throw new Error(
            "You do not have permission to perform this administrator action."
        );
    }

    // ========================================================
    // Determine response type
    //
    // DELETE endpoints in your Spring Boot backend return
    // plain text such as:
    //
    // "Student with id 5 deleted successfully"
    //
    // Other endpoints return JSON.
    // ========================================================

   const contentType =
    response.headers.get("content-type") || "";

let data;

if (contentType.includes("application/json")) {
    data = await response.json();
} else {
    data = await response.text();
}

if (!response.ok) {
    let message;

    if (typeof data === "string") {
        message = data;
    } else {
        message =
            data?.message ||
            data?.error ||
            "Request failed.";
    }

    throw new Error(message);
}

return data;
};
// ============================================================
// Default export
// ============================================================

export default COURSE_API;