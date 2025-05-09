import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Card, Space, Typography } from 'antd';
import { format } from 'date-fns';
import { getOrderByOrderId, getAllOrderDetailByOrderId } from '../../../services/admin_services/OrderService';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { completeOrder } from '../../../services/OrderService'; // THÊM DÒNG NÀY nếu chưa import


export const ManageOrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Quản lý chi tiết hoá đơn";
        fetchOrder();
        fetchOrderDetail();
    }, []);

    const fetchOrder = async () => {
        try {
            const response = await getOrderByOrderId(orderId);
            if (response.data.code === 200) {
                setOrder(response.data.result);
                console.log('Order data:', response.data.result);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchOrderDetail = async () => {
        try {
            const response = await getAllOrderDetailByOrderId(orderId);
            if (response.data.code === 200) {
                setOrderDetails(response.data.result);
            }
        } catch (error) {
            console.log(error);
        }
    };

    function VNToEN(str) {
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
        return str.split('').map(char => map[char] || char).join('');
    }

    const hanlePrintOrder = () => {
        if (!order || !orderDetails.length) return;

        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(VNToEN('HÓA ĐƠN THANH TOÁN'), 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(VNToEN(`Mã hoá đơn: ${order.orderId}`), 20, 40);
        doc.text(VNToEN(`Bàn: ${order.areaName} - ${order.tableName}`), 20, 50);
        doc.text(VNToEN(`Nhân viên: ${order.employeeName || "Không rõ"}`), 20, 60);
        doc.text(VNToEN(`Thời gian: ${format(new Date(order.createdAt), "dd-MM-yyyy HH:mm")}`), 20, 70);
        doc.text(VNToEN(`Phương thức: ${order.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}`), 20, 80);

        let y = 90;

        doc.autoTable({
            head: [[VNToEN('STT'), VNToEN('Tên món'), 'SL', VNToEN('Đơn giá'), VNToEN('Thành tiền')]],
            body: orderDetails.map((item, idx) => [
                idx + 1,
                VNToEN(item.foodName),
                item.quantity,
                item.foodPrice.toLocaleString(),
                (item.foodPrice * item.quantity).toLocaleString()
            ]),
            startY: y,
            theme: 'grid',
        });

        // ➕ Cập nhật logic tính toán:
        const beforeDiscount = orderDetails.reduce(
            (sum, item) => sum + item.foodPrice * item.quantity,
            0
        );

        const discountAmount = beforeDiscount - order.totalPrice;

        y = doc.autoTable.previous.finalY + 10;
        doc.text(VNToEN(`Tổng gốc: ${beforeDiscount.toLocaleString('vi-VN')} VND`), 135, y);

        if (discountAmount > 0) {
            y += 8;
            doc.text(VNToEN(`Giảm giá: -${discountAmount.toLocaleString('vi-VN')} VND`), 135, y);
        }

        y += 8;
        doc.setFontSize(16);
        doc.text(VNToEN(`Thành tiền: ${order.totalPrice.toLocaleString('vi-VN')} VND`), 135, y);

        doc.save(`HoaDon_${order.orderId}.pdf`);
    };

    const beforeDiscount = orderDetails.reduce(
        (sum, item) => sum + item.foodPrice * item.quantity,
        0
    );
    const discountAmount = beforeDiscount - (order?.totalPrice || 0);


    const columns = [
        {
            title: 'Tên món',
            dataIndex: 'foodName',
            key: 'foodName',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Giá (VND)',
            dataIndex: 'foodPrice',
            key: 'foodPrice',
            render: (price) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        },
        {
            title: 'Thành tiền (VND)',
            key: 'total',
            render: (_, record) => (record.foodPrice * record.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        },
        {
            title: 'Ghi chú món',
            dataIndex: 'foodNote',
            key: 'foodNote',
        },
    ];

    return (
        <div>
            <div className='flex justify-between border-b p-2'>
                <div className='flex items-center'>
                    <Button onClick={() => { navigate(-1) }}>
                        Trở về
                    </Button>
                    <p className='text-2xl ml-2'>Quản lý khu vực</p>
                </div>
                <Button onClick={hanlePrintOrder}>
                    In hoá đơn
                </Button>
            </div>
            <div className="flex space-x-3 p-2 bg-gray-50">
                <div className="w-[400px]">
                    <Card className="shadow-lg">
                        <Typography.Title level={4} className="mb-4">Thông tin đơn hàng</Typography.Title>
                        <div className="space-y-3">
                            <div>
                                <Typography.Text strong>Mã đơn hàng:</Typography.Text>
                                <p>{order?.orderId}</p>
                            </div>
                            <div>
                                <Typography.Text strong>Nhân viên tạo đơn:</Typography.Text>
                                <p>{order?.employeeName}</p>
                            </div>
                            <div className='flex justify-between'>
                                <div className='inline-flex gap-1'>
                                    <Typography.Text strong>Khu vực:</Typography.Text>
                                    <p>{order?.areaName || "Không xác định"}</p>
                                </div>
                                <div className='inline-flex gap-1'>
                                    <Typography.Text strong>Bàn:</Typography.Text>
                                    <p>{order?.tableName || "Không xác định"}</p>
                                </div>
                            </div>
                            <div>
                                <Typography.Text strong>Tổng giá trị:</Typography.Text>
                                <p>{beforeDiscount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                            </div>
                            <div className='flex justify-between'>
                                <div className='inline-flex gap-1'>
                                    <Typography.Text strong>Mã giảm giá:</Typography.Text>
                                    <p>{order?.discountCode || 'Không áp dụng'}</p>
                                </div>
                                <div className='inline-flex gap-1'>
                                    <Typography.Text strong>Giá trị giảm:</Typography.Text>
                                    <p>{discountAmount > 0 ? `-${discountAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}` : '0 VND'}</p>
                                </div>
                            </div>
                            <div>
                                <Typography.Text strong>Thời gian tạo đơn:</Typography.Text>
                                <p>{order?.createdAt ? format(new Date(order.createdAt), "dd-MM-yyyy HH:mm:ss") : "Không xác định"}</p>
                            </div>
                            <div>
                                <Typography.Text strong>Thời gian kết thúc:</Typography.Text>
                                <p>{order?.endedAt ? format(new Date(order.endedAt), "dd-MM-yyyy HH:mm:ss") : "Không xác định"}</p>
                            </div>
                            <div>
                                <Typography.Text strong>Ghi chú đơn hàng:</Typography.Text>
                                <p>{order?.note}</p>
                            </div>
                            <div className='text-xl'>
                                <Typography.Text strong>Thành tiền:</Typography.Text>
                                <p className='font-bold text-red-700'>
                                    {order?.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex-1">
                    <Card className="shadow-lg">
                        <Typography.Title level={4} className="mb-4">Chi tiết món ăn</Typography.Title>
                        <Table
                            dataSource={orderDetails}
                            columns={columns}
                            rowKey="foodId"
                            pagination={false}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
