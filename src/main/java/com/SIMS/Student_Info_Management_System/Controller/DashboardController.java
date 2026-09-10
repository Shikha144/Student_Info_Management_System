package com.SIMS.Student_Info_Management_System.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SIMS.Student_Info_Management_System.DTO.DashboardResponseDTO;
import com.SIMS.Student_Info_Management_System.Service.DashboardService;
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public DashboardResponseDTO getDashboard() {
        return dashboardService.getDashboardData();
    }

}
