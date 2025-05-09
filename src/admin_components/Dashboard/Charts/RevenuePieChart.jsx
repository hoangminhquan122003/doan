// src/admin_components/Dashboard/Charts/RevenuePieChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RevenuePieChart({ data }) {
    // Nhãn: rút gọn ID ca
    const labels = data.map(shift => `Ca ${shift.shiftId.slice(0, 8)}`);
    // Giá trị: tổng doanh thu mỗi ca
    const revenues = data.map(shift =>
        shift.orders.reduce((sum, o) => sum + o.totalPrice, 0)
    );

    const chartData = {
        labels,
        datasets: [{
            label: 'Tỉ trọng doanh thu',
            data: revenues,
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56',
                '#4BC0C0', '#9966FF', '#FF9F40'
            ],
            borderWidth: 1,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' },
            title: {
                display: true, text: 'Tỉ trọng doanh thu theo ca', position: 'top',      // vẫn ở trên
                align: 'start'
            },
        }
    };

    return (
        <div style={{ width: 350, height: 350, margin: '0 auto' }}>
            <Pie
                data={chartData}
                options={options}
                width={250}
                height={250}
            />
        </div>
    );
}
