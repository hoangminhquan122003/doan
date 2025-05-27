package com.group19.OrderManagementSystem_backend.repository;

import com.group19.OrderManagementSystem_backend.entity.EmployeeShiftLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeShiftLogRepository extends JpaRepository<EmployeeShiftLog, String> {
    List<EmployeeShiftLog> findByEmployee_Id(String employeeId);
    List<EmployeeShiftLog> findByShift_ShiftId(String shiftId);
    EmployeeShiftLog findByEmployee_IdAndShift_ShiftId(String employeeId, String shiftId);
}
