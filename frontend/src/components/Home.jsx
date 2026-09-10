import { Link } from "react-router";


function Home() {

    return (

        <div className="home-page">


            <nav className="navbar">

                <div className="logo">
                    SIMS
                </div>


                <div className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </nav>


            <section className="hero-section">

                <div className="hero-content">

                    <span className="hero-label">
                        STUDENT INFORMATION MANAGEMENT SYSTEM
                    </span>


                    <h1>
                        Manage academic information
                        <br />
                        <span>smarter.</span>
                    </h1>


                    <p>
                        A centralized platform for managing
                        students, professors, courses and
                        enrollments with secure role-based access.
                    </p>


                    <Link
                        to="/login"
                        className="hero-button"
                    >
                        Access Portal →
                    </Link>

                </div>

            </section>


            <section className="features-section">

                <div className="section-heading center">

                    <span className="section-label">
                        PLATFORM
                    </span>

                    <h2>
                        One system. Multiple roles.
                    </h2>

                    <p>
                        Each user gets a dedicated experience
                        based on their role.
                    </p>

                </div>


                <div className="portal-container">


                    <div className="portal-card">

                        <div className="portal-icon">
                            👨‍🎓
                        </div>

                        <span className="card-number">
                            01
                        </span>

                        <h3>
                            Student
                        </h3>

                        <p>
                            Access your profile and academic
                            information through a secure student portal.
                        </p>

                        <Link
                            to="/login"
                            className="portal-button"
                        >
                            Student Portal
                        </Link>

                    </div>


                    <div className="portal-card">

                        <div className="portal-icon">
                            👨‍🏫
                        </div>

                        <span className="card-number">
                            02
                        </span>

                        <h3>
                            Professor
                        </h3>

                        <p>
                            View assigned courses and monitor
                            student enrollments from one dashboard.
                        </p>

                        <Link
                            to="/login"
                            className="portal-button professor-button"
                        >
                            Professor Portal
                        </Link>

                    </div>


                    <div className="portal-card">

                        <div className="portal-icon">
                            👨‍💼
                        </div>

                        <span className="card-number">
                            03
                        </span>

                        <h3>
                            Administrator
                        </h3>

                        <p>
                            Manage students, professors, courses,
                            departments and enrollments.
                        </p>

                        <Link
                            to="/login"
                            className="portal-button admin-button"
                        >
                            Admin Portal
                        </Link>

                    </div>


                </div>

            </section>


            <footer>

                <div>
                    SIMS
                </div>

                <p>
                    Student Information Management System
                </p>

                <span>
                    © 2026 SIMS
                </span>

            </footer>

        </div>
    );
}


export default Home;