import BASE_URL from "../HTTPService";

// ✅ Check-in cho nhân viên
export const checkIn = (employeeId, shiftId) => {
    return BASE_URL.post("/shift-log/check-in", null, {
        params: { employeeId, shiftId }
    });
};

// ✅ Check-out cho nhân viên
export const checkOut = (employeeId, shiftId) => {
    return BASE_URL.post("/shift-log/check-out", null, {
        params: { employeeId, shiftId }
    });
};

// ✅ Lấy tất cả log theo employee
export const getLogsByEmployee = (employeeId) => {
    return BASE_URL.get(`/shift-log/employee/${employeeId}`);
};

// ✅ Lấy tổng kết tháng của employee
export const getMonthlySummary = (employeeId, startDate, endDate, hourlyRate) => {
    return BASE_URL.get(`/shift-log/employee/${employeeId}/summary`, {
        params: { startDate, endDate, hourlyRate }
    });
};

// ✅ Lấy danh sách work logs theo khoảng thời gian (startDate đến endDate)
export const getMonthlyWorkLogs = (employeeId, startDate, endDate) => {
    return BASE_URL.get(`/shift-log/employees/${employeeId}/worklogs`, {
        params: { startDate, endDate }
    });
};
