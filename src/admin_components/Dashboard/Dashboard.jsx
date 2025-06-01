import React, { useEffect, useState } from 'react';
import { DatePicker, Button } from 'antd';
import RevenueByShift from './Charts/RevenueByShift';
import RevenuePieChart from './Charts/RevenuePieChart';
import { getAllShift } from '../../services/admin_services/ShiftService';
import { getAllOrderByShiftIdCompleted, getOrderByOrderId } from '../../services/admin_services/OrderService';
import OrderSummary from './Charts/OrderSummary';

// Cache để tránh gọi lại API nhiều lần
const orderDetailsCache = {};
const getOrderDetails = async (orderId) => {
    if (orderDetailsCache[orderId]) return orderDetailsCache[orderId];
    try {
        const res = await getOrderByOrderId(orderId);
        if (res.data.code === 200) {
            orderDetailsCache[orderId] = res.data.result;
            return res.data.result;
        }
    } catch (e) {
        console.error(e);
    }
    return [];
};

export const Dashboard = () => {
    const [shifts, setShifts] = useState([]);
    const [data, setData] = useState([]); // full data
    const [displayData, setDisplayData] = useState([]); // filtered
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);

    useEffect(() => { fetchAllShift(); }, []);
    useEffect(() => { if (shifts.length) fetchOrdersForAllShifts(); }, [shifts]);

    useEffect(() => {
        // Khi data thay đổi lần đầu, set displayData = data (toàn bộ) nếu chưa filter
        setDisplayData(data);
    }, [data]);

    const fetchAllShift = async () => {
        try {
            const res = await getAllShift();
            if (res.data.code === 200) {
                const sorted = res.data.result.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                setShifts(sorted);
            }
        } catch (err) { console.error(err); }
    };

    const fetchOrdersForAllShifts = async () => {
        const arr = [];
        for (const shift of shifts) {
            try {
                const res = await getAllOrderByShiftIdCompleted(shift.shiftId);
                if (res.data.code === 200) {
                    const orders = res.data.result;
                    const withDetails = await Promise.all(
                        orders.map(async o => ({ ...o, details: await getOrderDetails(o.orderId) }))
                    );
                    arr.push({ shiftId: shift.shiftId, orders: withDetails });
                }
            } catch (err) { console.error(err); }
        }
        setData(arr);
    };

    // Áp dụng filter theo ngày hoặc tháng
    const applyFilter = () => {
        if (selectedDate) {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const filtered = data.map(s => ({
                shiftId: s.shiftId,
                orders: s.orders.filter(o => o.createdAt.startsWith(dateStr))
            })).filter(s => s.orders.length);
            setDisplayData(filtered);
        } else if (selectedMonth) {
            const monthStr = selectedMonth.format('YYYY-MM');
            const filtered = data.map(s => ({
                shiftId: s.shiftId,
                orders: s.orders.filter(o => o.createdAt.startsWith(monthStr))
            })).filter(s => s.orders.length);
            setDisplayData(filtered);
        }
    };

    // Reset về toàn bộ dữ liệu
    const resetFilter = () => {
        setSelectedDate(null);
        setSelectedMonth(null);
        setDisplayData(data);
    };

    return (
        <div>
            <div className='flex border-b p-2 items-center'>
                <p className='flex-grow ml-2 text-2xl'>Tổng quan</p>
                <div className="flex items-center space-x-2 mr-4">
                    <DatePicker
                        onChange={(d) => { setSelectedDate(d); setSelectedMonth(null); }}
                        placeholder="Chọn ngày"
                    />
                    <DatePicker.MonthPicker
                        onChange={(m) => { setSelectedMonth(m); setSelectedDate(null); }}
                        placeholder="Chọn tháng"
                    />
                    <Button type="primary" onClick={applyFilter}>Lọc</Button>
                    <Button onClick={resetFilter}>Toàn bộ</Button>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <div className="p-4 mb-4 flex justify-center bg-white rounded-lg">
                    <OrderSummary data={displayData} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white shadow-lg rounded-lg min-h-56">
                        <RevenueByShift data={displayData} />
                    </div>
                    <div className="p-4 bg-white shadow-lg rounded-lg min-h-56">
                        <RevenuePieChart data={displayData} />
                    </div>
                </div>
            </div>
        </div>
    );
};