import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, Row, Col, DatePicker, message } from 'antd';
import { getMonthlyWorkLogs } from '../../../services/admin_services/ShiftLogService';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

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

    // Hàm fetch dữ liệu theo khoảng thời gian
    const fetchWorkLogsInRange = async (fromDate, toDate) => {
        setLoading(true);
        let logs = [];

        const start = dayjs(fromDate).startOf('day');
        const end = dayjs(toDate).endOf('day');

        try {
            const res = await getMonthlyWorkLogs(employeeDetail.id, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
            console.log('Raw API res:', res);

            if (!res || !res.data) {
                message.error('Không có dữ liệu!');
                return;
            }

            logs = res.data;
            console.log('Parsed logs:', logs.map(log => log.date));

            // Kiểm tra giá trị ngày của từng log và so sánh
            const filteredLogs = logs.filter(log => {
                const logDate = dayjs(log.date).startOf('day');  // Chuyển logDate về đúng múi giờ và thời gian bắt đầu ngày
                console.log(`Log Date: ${logDate.format('YYYY-MM-DD')}`);  // Kiểm tra giá trị log date của từng bản ghi

                console.log('Start Date:', start.format()); // Kiểm tra start date
                console.log('End Date:', end.format());  // Kiểm tra end date

                // Điều kiện lọc: Kiểm tra logDate có trong khoảng từ start đến end hay không
                return logDate.isSameOrAfter(start) && logDate.isSameOrBefore(end);
            });

            console.log('Filtered logs:', filteredLogs);

            if (filteredLogs.length === 0) {
                message.warning('Không có dữ liệu trong khoảng thời gian này!');
                setWorkLogs([]); // Xóa dữ liệu cũ
                setTotalHours(0);
                setTotalSessions(0);
                return;
            } else {
                let totalH = 0;
                let sessionCount = 0;

                filteredLogs.forEach(log => {
                    if (!Array.isArray(log.sessions)) {
                        console.warn('Invalid sessions format:', log);
                        return;
                    }
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



    // Gọi khi mới mở modal hoặc khi chọn ngày
    useEffect(() => {
        if (employeeDetail?.id) {
            fetchWorkLogsInRange(startDate, endDate);
        }
    }, [employeeDetail, startDate, endDate]);


    // Định dạng lại logs để hiển thị
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
                            <Text strong>Tổng thời gian làm việc:</Text> <Text>{totalHours} giờ</Text>
                        </Col>
                        <Col>
                            <Text strong>Số lần làm việc:</Text> <Text>{totalSessions}</Text>
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
