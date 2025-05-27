package com.group19.OrderManagementSystem_backend.service;

import com.group19.OrderManagementSystem_backend.dto.response.DailyWorkLog;
import com.group19.OrderManagementSystem_backend.dto.response.MonthlySummaryDTO;
import com.group19.OrderManagementSystem_backend.dto.response.WorkSession;
import com.group19.OrderManagementSystem_backend.entity.Employee;
import com.group19.OrderManagementSystem_backend.entity.EmployeeShiftLog;
import com.group19.OrderManagementSystem_backend.entity.Shift;
import com.group19.OrderManagementSystem_backend.exception.AppException;
import com.group19.OrderManagementSystem_backend.exception.ErrorCode;
import com.group19.OrderManagementSystem_backend.repository.EmployeeRepository;
import com.group19.OrderManagementSystem_backend.repository.EmployeeShiftLogRepository;
import com.group19.OrderManagementSystem_backend.repository.ShiftRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmployeeShiftLogService {

    @Autowired
    private EmployeeShiftLogRepository shiftLogRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    public void checkIn(String employeeId, String shiftId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXITED));
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_NOT_EXITED));

        EmployeeShiftLog log = EmployeeShiftLog.builder()
                .employee(employee)
                .shift(shift)
                .checkInTime(LocalDateTime.now())
                .build();

        shiftLogRepository.save(log);
    }

    public void checkOut(String employeeId, String shiftId) {
        log.info("employee {}, shift {}",employeeId,shiftId);
        EmployeeShiftLog log1 = shiftLogRepository.findByEmployee_IdAndShift_ShiftId(employeeId, shiftId);
        if (log1 == null || log1.getCheckOutTime() != null) {
            log.info("loi");
            throw new AppException(ErrorCode.SHIFT_LOG_NOT_FOUND);
        }
        log1.setCheckOutTime(LocalDateTime.now());
        log.info("{}",log1.getCheckOutTime());

        shiftLogRepository.save(log1);
    }

    public List<EmployeeShiftLog> getLogsByEmployee(String employeeId) {
        return shiftLogRepository.findByEmployee_Id(employeeId);
    }

    public MonthlySummaryDTO getMonthlySummary(String employeeId, LocalDate startDate, LocalDate endDate, double hourlyRate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXITED));

        // Lấy daily logs theo khoảng thời gian
        List<DailyWorkLog> dailyLogs = getMonthlyWorkLogs(employeeId, startDate, endDate);

        double totalHours = dailyLogs.stream()
                .mapToDouble(DailyWorkLog::getTotalHours)
                .sum();

        double totalSalary = totalHours * hourlyRate;

        return MonthlySummaryDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFullName())
                .startDate(startDate) // Cập nhật với startDate và endDate
                .endDate(endDate)
                .totalHours(totalHours)
                .totalSalary(totalSalary)
                .dailyLogs(dailyLogs)
                .build();
    }


    public List<DailyWorkLog> getMonthlyWorkLogs(String employeeId, LocalDate startDate, LocalDate endDate) {
        // Lấy tất cả logs của employee
        List<EmployeeShiftLog> logs = shiftLogRepository.findByEmployee_Id(employeeId);

        // Lọc logs theo ngày trong khoảng startDate và endDate
        List<DailyWorkLog> dailyLogs = logs.stream()
                .filter(log -> {
                    LocalDate logDate = log.getShift().getDate(); // Ngày làm việc từ log
                    return (logDate.isEqual(startDate) || logDate.isAfter(startDate)) &&
                            (logDate.isEqual(endDate) || logDate.isBefore(endDate));
                })
                .collect(Collectors.groupingBy(log -> log.getShift().getDate())) // Nhóm theo ngày
                .entrySet()
                .stream()
                .map(entry -> {
                    LocalDate date = entry.getKey(); // Ngày làm việc
                    List<WorkSession> sessions = entry.getValue().stream()
                            .map(log -> {
                                double hours = calculateTotalHours(log); // Tính tổng giờ làm việc
                                return WorkSession.builder()
                                        .checkInTime(log.getCheckInTime())
                                        .checkOutTime(log.getCheckOutTime())
                                        .hours(hours)
                                        .build();
                            }).collect(Collectors.toList());

                    // Tính tổng số giờ trong ngày
                    double totalHours = sessions.stream().mapToDouble(WorkSession::getHours).sum();

                    // Trả về DailyWorkLog với ngày và danh sách sessions
                    return DailyWorkLog.builder()
                            .date(date)  // Gán ngày cho DailyWorkLog
                            .sessions(sessions)
                            .totalHours(totalHours)
                            .build();
                })
                .sorted(Comparator.comparing(DailyWorkLog::getDate)) // Sắp xếp theo ngày
                .collect(Collectors.toList());

        return dailyLogs;
    }

    public double calculateTotalHours(EmployeeShiftLog log) {
        if (log.getCheckInTime() != null && log.getCheckOutTime() != null) {
            return Duration.between(log.getCheckInTime(), log.getCheckOutTime()).toMinutes() / 60.0;
        }
        return 0;
    }
}
