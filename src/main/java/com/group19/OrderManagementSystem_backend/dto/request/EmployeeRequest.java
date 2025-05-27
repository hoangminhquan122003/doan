package com.group19.OrderManagementSystem_backend.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {
    private String username;
    private String password;
    private String fullName;
}
