package com.group19.OrderManagementSystem_backend.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWorkLog {
    private LocalDate date;       // Ngày làm việc
    private List<WorkSession> sessions; // Các ca trong ngày
    private double totalHours;    // Tổng giờ trong ngày
}
