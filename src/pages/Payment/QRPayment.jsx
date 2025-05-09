import React, { useEffect, useState } from 'react';
import { Spin, Typography, Alert } from 'antd';
import { getQRInfo } from '../../services/PaymentService'; // service gọi API

const { Title, Text } = Typography;

export default function QRPayment({ orderId, amount: propAmount }) {
    const [loading, setLoading] = useState(true);
    const [qrInfo, setQrInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await getQRInfo(orderId);
                // assuming backend returns { bankId, accountNumber, accountName, amount, note }
                const info = res.data.result || res.data;
                setQrInfo(info);
            } catch (err) {
                setError('Không lấy được thông tin QR');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQR();
    }, [orderId]);

    if (loading) return <Spin tip="Đang tải mã QR..." />;
    if (error) return <Alert type="error" message={error} />;
    if (!qrInfo) return <Alert type="warning" message="Không có thông tin QR." />;

    // Determine display amount: propAmount > 0 ? propAmount : backend amount
    const displayAmount = typeof propAmount === 'number' && propAmount > 0
        ? propAmount
        : qrInfo.amount;

    // Build QR URL dynamically using VietQR
    const qrURL = `https://img.vietqr.io/image/${qrInfo.bankId}-${qrInfo.accountNumber}-compact2.png`
        + `?amount=${displayAmount}`
        + `&addInfo=${encodeURIComponent(qrInfo.note)}`
        + `&accountName=${encodeURIComponent(qrInfo.accountName)}`;

    return (
        <div className="text-center">
            <Title level={4}>Quét mã QR để chuyển khoản</Title>
            <img
                src={qrURL}
                alt="QR Code"
                style={{ maxWidth: '300px', margin: '0 auto' }}
            />
            <div className="mt-4 text-left inline-block">
                <Text strong>Ngân hàng:</Text> {qrInfo.bankId.toUpperCase()}<br />
                <Text strong>Số tài khoản:</Text> {qrInfo.accountNumber}<br />
                <Text strong>Chủ tài khoản:</Text> {qrInfo.accountName}<br />
                <Text strong>Số tiền:</Text> {displayAmount.toLocaleString()} VND<br />
                <Text strong>Nội dung:</Text> {qrInfo.note}
            </div>
        </div>
    );
}
