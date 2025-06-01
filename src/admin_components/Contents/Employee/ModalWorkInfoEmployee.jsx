import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, Row, Col, DatePicker, message, InputNumber } from 'antd';
import { getMonthlyWorkLogs } from '../../../services/admin_services/ShiftLogService';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const ModalWorkInfoEmployee = ({ employeeDetail }) => {
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [workLogs, setWorkLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalHours, setTotalHours] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [hourlyRate, setHourlyRate] = useState(0);
    const [totalWage, setTotalWage] = useState(0);

    const handleExportExcel = () => {
        const dataToExport = formattedLogs.map((log, index) => ({
            STT: index + 1,
            Ngày: log.workDate,
            'Giờ bắt đầu': log.startTime,
            'Giờ kết thúc': log.endTime,
            'Tổng giờ': log.totalHours,
        }));

        // Tạo worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Tính dòng tiếp theo để ghi tổng số giờ
        const totalRowIndex = dataToExport.length + 2;
        const wageRowIndex = totalRowIndex + 1;

        // Ghi tổng giờ làm việc
        XLSX.utils.sheet_add_aoa(worksheet, [
            [`Tổng thời gian làm việc: ${totalHours} giờ`]
        ], { origin: `A${totalRowIndex}` });

        // Ghi tổng lương nếu có
        if (hourlyRate > 0) {
            XLSX.utils.sheet_add_aoa(worksheet, [
                [`Tổng lương: ${new Intl.NumberFormat('vi-VN').format(totalWage)} ₫`]
            ], { origin: `A${wageRowIndex}` });
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử làm việc');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const fileName = `worklog_${employeeDetail?.fullName?.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, fileName);
    };



    const fetchWorkLogsInRange = async (fromDate, toDate) => {
        setLoading(true);
        let logs = [];

        const start = dayjs(fromDate).startOf('day');
        const end = dayjs(toDate).endOf('day');

        try {
            const res = await getMonthlyWorkLogs(employeeDetail.id, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));

            if (!res || !res.data) {
                message.error('Không có dữ liệu!');
                return;
            }

            logs = res.data;

            const filteredLogs = logs.filter(log => {
                const logDate = dayjs(log.date).startOf('day');
                return logDate.isSameOrAfter(start) && logDate.isSameOrBefore(end);
            });

            if (filteredLogs.length === 0) {
                message.warning('Không có dữ liệu trong khoảng thời gian này!');
                setWorkLogs([]);
                setTotalHours(0);
                setTotalSessions(0);
                return;
            } else {
                let totalH = 0;
                let sessionCount = 0;

                filteredLogs.forEach(log => {
                    if (!Array.isArray(log.sessions)) return;
                    log.sessions.forEach(session => {
                        if (session.hours) {
                            totalH += session.hours;
                        }
                        sessionCount++;
                    });
                });

                setWorkLogs(filteredLogs);
                setTotalHours(totalH.toFixed(2));
                setTotalSessions(sessionCount);
            }
        } catch (err) {
            console.error('Caught error:', err);
            message.error('Lỗi khi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeDetail?.id) {
            fetchWorkLogsInRange(startDate, endDate);
        }
    }, [employeeDetail, startDate, endDate]);

    // Tính lại tổng tiền khi thay đổi giờ hoặc giá
    useEffect(() => {
        const wage = parseFloat(totalHours) * parseFloat(hourlyRate);
        setTotalWage(wage.toFixed(2));
    }, [totalHours, hourlyRate]);

    const formattedLogs = workLogs.flatMap(log =>
        log.sessions.map(session => ({
            workDate: log.date,
            startTime: session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString() : '—',
            endTime: session.checkOutTime ? new Date(session.checkOutTime).toLocaleTimeString() : '—',
            totalHours: session.hours?.toFixed(2) || '0.00',
        }))
    );

    const columns = [
        { title: 'Ngày', dataIndex: 'workDate', key: 'workDate', align: 'center' },
        { title: 'Giờ bắt đầu', dataIndex: 'startTime', key: 'startTime', align: 'center' },
        { title: 'Giờ kết thúc', dataIndex: 'endTime', key: 'endTime', align: 'center' },
        { title: 'Tổng giờ', dataIndex: 'totalHours', key: 'totalHours', align: 'center' },
    ];

    return (
        <div>
            <Title level={4}>Thông tin làm việc: {employeeDetail?.fullName}</Title>

            <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                <Col>
                    <Text strong>Từ ngày:</Text>
                    <DatePicker
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        format="YYYY-MM-DD"
                    />
                </Col>
                <Col>
                    <Text strong>Đến ngày:</Text>
                    <DatePicker
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        format="YYYY-MM-DD"
                    />
                </Col>
            </Row>

            {loading ? (
                <Spin />
            ) : (
                <>
                    <Row gutter={[16, 8]}>
                        <Col>
                            <Text strong>Tổng thời gian làm việc:</Text>{' '}
                            <Text>{totalHours} giờ</Text>
                        </Col>
                        <Col>
                            <Text strong>Số lần làm việc:</Text>{' '}
                            <Text>{totalSessions}</Text>
                        </Col>
                    </Row>

                    <Row gutter={[16, 8]} style={{ marginTop: 12 }}>
                        <Col>
                            <Text strong>Giá tiền mỗi giờ:</Text>{' '}
                            <InputNumber
                                value={hourlyRate}
                                onChange={(value) => setHourlyRate(value || 0)}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/,/g, '')}
                                addonAfter="₫"
                            />
                        </Col>
                        <Col>
                            <Text strong>Tổng tiền lương:</Text>{' '}
                            <Text type="success">
                                {new Intl.NumberFormat('vi-VN').format(totalWage)} ₫
                            </Text>
                        </Col>
                    </Row>
                    <Row justify="end" style={{ marginTop: 16 }}>
                        <Col>
                            <Button type="primary" onClick={handleExportExcel}>
                                Xuất Excel
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        style={{ marginTop: 16 }}
                        columns={columns}
                        dataSource={formattedLogs}
                        rowKey={(_, index) => index}
                        pagination={{ pageSize: 6, position: ['bottomCenter'] }}
                    />
                </>
            )}
        </div>
    );
};
