// src/pages/Payment/PaymentMethod.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from '../../components/Nav/Nav';
import Side from '../../components/Side/Side';
import { Layout, Card, Typography, Button, Row, Col, notification } from 'antd';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRPayment from './QRPayment';
import { updateOrder, completeOrder } from '../../services/OrderService';
import { getAllOrderDetailByOrderId } from '../../services/admin_services/OrderService';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function PaymentMethod() {
    const [showQR, setShowQR] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();
    const { orderId, tableId, note, discountCode, beforeDiscount, totalAmount } = state;
    const [loading, setLoading] = useState(false);
    function VNToEN(str) {
        // Bảng ánh xạ các ký tự có dấu sang không dấu
        const map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd',
            'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
            'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
            'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
            'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
            'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
            'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
            'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
            'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
            'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
            'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
            'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
            'Đ': 'D'
        };

        // Chuyển chuỗi thành mảng ký tự, thay thế từng ký tự có dấu, rồi nối lại
        return str.split('').map(char => map[char] || char).join('');
    }


    const onPay = async (method) => {
        setLoading(true);
        try {
            // 1. Update order
            await updateOrder(orderId, { note, tableId, discountCode, paymentMethod: method });
            // 2. Complete order
            const resp = await completeOrder(orderId);
            const order = resp.data.result;
            // 3. Fetch details
            const details = (await getAllOrderDetailByOrderId(orderId)).data.result;
            // 4. Export PDF
            // Thay thế phần trong onPay:
            const doc = new jsPDF();

            doc.setFontSize(22);
            doc.text(VNToEN(' HÓA ĐƠN THANH TOÁN '), 105, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text(VNToEN(`Mã hoá đơn: ${order.orderId}`), 20, 40);
            doc.text(VNToEN(`Bàn: ${order.areaName} - ${order.tableName}`), 20, 50);
            doc.text(VNToEN(`Phương thức: ${method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}`), 20, 60);

            let y = 80;
            doc.autoTable({
                head: [[VNToEN('STT'), VNToEN('Tên món'), 'SL', VNToEN('Đơn giá'), VNToEN('Thành tiền')]],
                body: details.map((i, idx) => [
                    idx + 1,
                    VNToEN(i.foodName),
                    i.quantity,
                    i.foodPrice.toLocaleString(),
                    (i.foodPrice * i.quantity).toLocaleString()
                ]),
                startY: y,
                theme: 'grid',
            });
            y = doc.autoTable.previous.finalY + 10;

            doc.text(VNToEN(`Tổng gốc: ${beforeDiscount.toLocaleString()} VND`), 135, y);
            if (order.discountValue > 0) {
                y += 8;
                doc.text(VNToEN(`Giảm giá: -${order.discountValue.toLocaleString()} VND`), 135, y);
            }
            y += 8;
            doc.setFontSize(16);
            doc.text(VNToEN(`Thành tiền: ${order.totalPrice.toLocaleString()} VND`), 135, y);

            doc.save(`HoaDon_${order.orderId}.pdf`);


            notification.success({ message: 'Thanh toán thành công', duration: 2 });
            navigate('/');
        } catch (err) {
            console.error(err);
            notification.error({ message: 'Thanh toán thất bại', duration: 2 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="min-h-screen">
            <Nav />
            <Layout>
                <Side />
                <Layout style={{ padding: '24px' }}>
                    <Content>
                        <Card
                            bordered={false}
                            className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-indigo-100 to-pink-50"
                            style={{ borderRadius: '12px' }}
                        >
                            <Title level={3} className="text-center text-indigo-700 mb-4">
                                Chọn Phương Thức Thanh Toán
                            </Title>
                            <Row gutter={16} className="mb-4">
                                <Col span={12}>
                                    <Text strong>Tổng gốc:</Text><br />
                                    <Text type="danger">{beforeDiscount.toLocaleString()} VND</Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Đã giảm:</Text><br />
                                    <Text type="warning">
                                        {discountCode ? `- ${(beforeDiscount - totalAmount).toLocaleString()} VND` : '0 VND'}
                                    </Text>
                                </Col>
                            </Row>
                            <div className="text-right mb-6">
                                <Text strong style={{ fontSize: '18px' }}>Cần thanh toán: </Text>
                                <Text strong type="success" style={{ fontSize: '20px' }}>
                                    {totalAmount.toLocaleString()} VND
                                </Text>
                            </div>
                            {showQR ? (
                                <div className="text-center" >
                                    <QRPayment orderId={orderId} amount={totalAmount} />
                                    <Button
                                        type="primary"
                                        loading={loading}
                                        className="mt-4 bg-green-500 hover:bg-green-600"
                                        onClick={() => onPay('TRANSFER')}
                                    >
                                        ✅ Tôi đã chuyển khoản
                                    </Button>
                                    <Button
                                        type="default"
                                        className="mt-2"
                                        onClick={() => setShowQR(false)}
                                    >
                                        ❌ Huỷ
                                    </Button>
                                </div>
                            ) : (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Button
                                            block
                                            type="primary"
                                            size="large"
                                            loading={loading}
                                            className="bg-green-500 hover:bg-green-600"
                                            onClick={() => onPay('CASH')}
                                        >
                                            💵 Tiền mặt
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            block
                                            type="default"
                                            size="large"
                                            loading={loading}
                                            className="bg-blue-400 hover:bg-blue-500 text-white"
                                            onClick={() => setShowQR(true)}
                                        >
                                            🏦 Chuyển khoản
                                        </Button>
                                    </Col>
                                </Row>
                            )}

                        </Card>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}
