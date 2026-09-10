package com.SIMS.Student_Info_Management_System.config;

import java.util.List;

/*import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.SIMS.Student_Info_Management_System.Service.CustomUserDetailsService;
import java.util.List;

import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JWTFilter jwtFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http

            // =====================================================
            // CSRF
            // =====================================================
            .csrf(csrf -> csrf.disable())


            // =====================================================
            // CORS
            // =====================================================
            // CORS configuration is provided by CorsConfig.java
            .cors(Customizer.withDefaults())


            // =====================================================
            // AUTHORIZATION
            // =====================================================
            .authorizeHttpRequests(request -> request


                // =================================================
                // PUBLIC ENDPOINTS
                // =================================================
                .requestMatchers(
                    "/auth/**",
                    "/student/login",
                    "/student/register",

                    // Swagger / OpenAPI
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()


                // =================================================
                // ADMIN - STUDENT MANAGEMENT
                // =================================================
                .requestMatchers(
                    "/student/AllStudents",
                    "/student/getData",
                    "/student/update/**",
                    "/student/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN / PROFESSOR - VIEW PROFESSORS
                // =================================================
                .requestMatchers(
                    "/professor/getData"
                ).hasAnyRole(
                    "ADMIN",
                    "PROFESSOR"
                )


                // =================================================
                // ADMIN - PROFESSOR MANAGEMENT
                // =================================================
                .requestMatchers(
                    "/professor/create",
                    "/professor/update/**",
                    "/professor/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ALL ROLES - VIEW COURSES
                // =================================================
                .requestMatchers(
                    "/courses/getCourses"
                ).hasAnyRole(
                    "ADMIN",
                    "PROFESSOR",
                    "STUDENT"
                )


                // =================================================
                // ADMIN - COURSE MANAGEMENT
                // =================================================
                .requestMatchers(
                    "/courses/create",
                    "/courses/update/**",
                    "/courses/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN - DEPARTMENT MANAGEMENT
                // =================================================
                .requestMatchers(
                    "/api/department/getData",
                    "/api/department/create",
                    "/api/department/update/**",
                    "/api/department/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN - ENROLLMENT MANAGEMENT
                // =================================================
                .requestMatchers(
                    "/api/getEnrollments",
                    "/api/get/**",
                    "/api/update/**",
                    "/api/delete/**",
                    "/api/createEnrollments"
                ).hasRole("ADMIN")


                // =================================================
                // STUDENT - OWN PROFILE
                // =================================================
                .requestMatchers(
                    "/student/me"
                ).hasRole("STUDENT")


                // =================================================
                // STUDENT - ENROLLMENT
                // =================================================
                .requestMatchers(
                    "/api/enrollments/**"
                ).hasRole("STUDENT")


                // =================================================
                // PROFESSOR - OWN DASHBOARD
                // =================================================
                .requestMatchers(
                    "/professor/me",
                    "/professor/enrollments/**"
                ).hasRole("PROFESSOR")


                // =================================================
                // ADMIN
                // =================================================
                .requestMatchers(
                    "/admins/**"
                ).hasRole("ADMIN")


                // =================================================
                // REMAINING PROFESSOR ENDPOINTS
                // =================================================
                .requestMatchers(
                    "/professor/**"
                ).hasRole("PROFESSOR")


                // =================================================
                // REMAINING STUDENT ENDPOINTS
                // =================================================
                .requestMatchers(
                    "/student/**"
                ).hasRole("STUDENT")


                // =================================================
                // EVERYTHING ELSE
                // =================================================
                .anyRequest().authenticated()
            )


            // =====================================================
            // JWT FILTER
            // =====================================================
            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }


    // =============================================================
    // PASSWORD ENCODER
    // =============================================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }


    // =============================================================
    // AUTHENTICATION PROVIDER
    // =============================================================
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(customUserDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }


    // =============================================================
    // AUTHENTICATION MANAGER
    // =============================================================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }
}*/


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.SIMS.Student_Info_Management_System.Service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JWTFilter jwtFilter;


    // =============================================================
    // SECURITY FILTER CHAIN
    // =============================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // =====================================================
            // CSRF
            // =====================================================

            .csrf(csrf -> csrf.disable())


            // =====================================================
            // CORS
            //
            // CORS configuration is provided by CorsConfig.java.
            // DO NOT define another corsConfigurationSource()
            // bean in this class.
            // =====================================================

            .cors(Customizer.withDefaults())


            // =====================================================
            // AUTHORIZATION
            // =====================================================

            .authorizeHttpRequests(auth -> auth


                // =================================================
                // CORS PREFLIGHT
                // =================================================

                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()


                // =================================================
                // PUBLIC ENDPOINTS
                // =================================================

                .requestMatchers(
                    "/auth/**",
                    "/student/login",
                    "/student/register",

                    // Swagger / OpenAPI
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()


                // =================================================
                // ADMIN - STUDENT MANAGEMENT
                // =================================================

                .requestMatchers(
                    "/student/AllStudents",
                    "/student/getData",
                    "/student/id/**",
                    "/student/update/**",
                    "/student/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN - CREATE STUDENT
                // =================================================

                .requestMatchers(
                    "/student/admin/create"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN / PROFESSOR - VIEW PROFESSORS
                // =================================================

                .requestMatchers(
                    "/professor/getData"
                ).hasAnyRole(
                    "ADMIN",
                    "PROFESSOR"
                )


                // =================================================
                // ADMIN - PROFESSOR MANAGEMENT
                // =================================================

                .requestMatchers(
                    "/professor/create",
                    "/professor/update/**",
                    "/professor/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ALL ROLES - VIEW COURSES
                // =================================================

                .requestMatchers(
                    "/courses/getCourses"
                ).hasAnyRole(
                    "ADMIN",
                    "PROFESSOR",
                    "STUDENT"
                )


                // =================================================
                // ADMIN - COURSE MANAGEMENT
                // =================================================

                .requestMatchers(
                    "/courses/create",
                    "/courses/update/**",
                    "/courses/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN - DEPARTMENT MANAGEMENT
                // =================================================

                .requestMatchers(
                    "/api/department/getData",
                    "/api/department/create",
                    "/api/department/update/**",
                    "/api/department/delete/**"
                ).hasRole("ADMIN")


                // =================================================
                // ADMIN - ENROLLMENT MANAGEMENT
                // =================================================

                .requestMatchers(
                    "/api/getEnrollments",
                    "/api/get/**",
                    "/api/update/**",
                    "/api/delete/**",
                    "/api/createEnrollments"
                ).hasRole("ADMIN")


                // =================================================
                // STUDENT - OWN PROFILE
                // =================================================

                .requestMatchers(
                    "/student/me"
                ).hasRole("STUDENT")


                // =================================================
                // STUDENT - OWN ENROLLMENTS
                // =================================================

                .requestMatchers(
                    "/api/enrollments/**"
                ).hasRole("STUDENT")


                // =================================================
                // PROFESSOR - OWN DASHBOARD
                // =================================================

                .requestMatchers(
                    "/professor/me",
                    "/professor/enrollments/**"
                ).hasRole("PROFESSOR")


                // =================================================
                // ADMIN ENDPOINTS
                // =================================================

                .requestMatchers(
                    "/admins/**"
                ).hasRole("ADMIN")


                // =================================================
                // REMAINING PROFESSOR ENDPOINTS
                // =================================================

                .requestMatchers(
                    "/professor/**"
                ).hasRole("PROFESSOR")


                // =================================================
                // REMAINING STUDENT ENDPOINTS
                // =================================================

                .requestMatchers(
                    "/student/**"
                ).hasRole("STUDENT")


                // =================================================
                // EVERYTHING ELSE
                // =================================================

                .anyRequest().authenticated()
            )


            // =====================================================
            // JWT FILTER
            // =====================================================

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            );


        return http.build();
    }


    // =============================================================
    // PASSWORD ENCODER
    // =============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder(12);
    }


    // =============================================================
    // AUTHENTICATION PROVIDER
    // =============================================================

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                    customUserDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }


    // =============================================================
    // AUTHENTICATION MANAGER
    // =============================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}
