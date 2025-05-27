package com.group19.OrderManagementSystem_backend.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummaryDTO {
    private String employeeId;
    private String employeeName;
    private LocalDate startDate;  // Sửa lại từ year và month thành startDate
    private LocalDate endDate;    // Sửa lại từ year và month thành endDate
    private double totalHours;    // Tổng số giờ làm trong khoảng thời gian
    private double totalSalary;   // Tổng lương
    private List<DailyWorkLog> dailyLogs; // Danh sách log theo ngày
}
