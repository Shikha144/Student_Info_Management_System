package com.SIMS.Student_Info_Management_System.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.SIMS.Student_Info_Management_System.Service.CustomUserDetailsService;
import com.SIMS.Student_Info_Management_System.Service.JWTStudentService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTFilter extends OncePerRequestFilter {

@Autowired
private JWTStudentService jwtService;

@Autowired
private CustomUserDetailsService userDetailsService;

@Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

    String requestUri = request.getRequestURI();

    // =========================================================
    // PUBLIC ENDPOINTS
    // JWT authentication is NOT required for these endpoints.
    // Always let them continue to Spring Security authorization.
    // =========================================================

    if (requestUri.equals("/student/login")
            || requestUri.equals("/student/register")
        || requestUri.equals("/professor/login")
            || requestUri.startsWith("/auth/")
            || requestUri.startsWith("/v3/api-docs")
            || requestUri.startsWith("/swagger-ui")) {

        filterChain.doFilter(request, response);
        return;
    }

    // =========================================================
    // READ JWT
    // =========================================================

    String authHeader = request.getHeader("Authorization");

    // No Bearer token:
    // continue normally and let Spring Security decide whether
    // the endpoint requires authentication.
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
    }

    String token = authHeader.substring(7).trim();

    if (token.isEmpty()) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        String email = jwtService.extractUsername(token);

        if (email != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            var userDetails =
                    userDetailsService.loadUserByUsername(email);

            System.out.println("====================================");
            System.out.println("REQUEST URI: " + requestUri);
            System.out.println("JWT EMAIL: " + email);
            System.out.println("USER: " + userDetails.getUsername());
            System.out.println("AUTHORITIES: " + userDetails.getAuthorities());
            System.out.println("====================================");

            if (jwtService.validateToken(token, userDetails)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }
        }

    } catch (Exception ex) {

        // Do NOT turn an invalid JWT into a custom 403 here.
        // Clear the authentication and allow Spring Security
        // to handle protected/public endpoint authorization.
        SecurityContextHolder.clearContext();

        System.out.println(
                "JWT validation failed for "
                + requestUri
                + ": "
                + ex.getMessage()
        );
    }

    filterChain.doFilter(request, response);
}

}
