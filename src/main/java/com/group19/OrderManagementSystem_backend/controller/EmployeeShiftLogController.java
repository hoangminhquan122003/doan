package com.group19.OrderManagementSystem_backend.controller;

import com.group19.OrderManagementSystem_backend.dto.response.DailyWorkLog;
import com.group19.OrderManagementSystem_backend.dto.response.MonthlySummaryDTO;
import com.group19.OrderManagementSystem_backend.entity.EmployeeShiftLog;
import com.group19.OrderManagementSystem_backend.service.EmployeeShiftLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/shift-log")
public class EmployeeShiftLogController {
    @Autowired
    private EmployeeShiftLogService shiftLogService;

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestParam String employeeId, @RequestParam String shiftId) {
        shiftLogService.checkIn(employeeId, shiftId);
        return ResponseEntity.ok("Check-in thành công");
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestParam String employeeId, @RequestParam String shiftId) {
        shiftLogService.checkOut(employeeId, shiftId);
        return ResponseEntity.ok("Check-out thành công");
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeShiftLog>> getLogs(@PathVariable String employeeId) {
        return ResponseEntity.ok(shiftLogService.getLogsByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/summary")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam double hourlyRate
    ) {
        return ResponseEntity.ok(shiftLogService.getMonthlySummary(employeeId, startDate, endDate, hourlyRate));
    }

    @GetMapping("/employees/{employeeId}/worklogs")
    public ResponseEntity<List<DailyWorkLog>> getMonthlyLogs(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(shiftLogService.getMonthlyWorkLogs(employeeId, startDate,endDate));
    }

}
