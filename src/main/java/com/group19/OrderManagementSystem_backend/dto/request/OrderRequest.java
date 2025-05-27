package com.group19.OrderManagementSystem_backend.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String note;
    private String employeeId;
    private String tableId;
    private String discountCode;
}
