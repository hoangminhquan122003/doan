package com.group19.OrderManagementSystem_backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSession {
    private LocalDateTime checkInTime;  // Thời gian check-in
    private LocalDateTime checkOutTime; // Thời gian check-out
    private double hours;               // Số giờ làm việc
}
