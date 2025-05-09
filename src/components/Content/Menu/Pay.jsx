import save from '../../../assets/save.png';
import del from '../../../assets/delete.png';
import '../../../assets/Menu/Menu.css';
import FoodPay from './FoodPay';
import { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, notification, Popconfirm } from "antd";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Nếu bạn sử dụng autotable
// import font from '../../../assets/Roboto/Roboto-Black.ttf';
import { useNavigate, useParams } from 'react-router-dom';
import { completeOrder, deleteOrder } from '../../../services/OrderService';
import { getDiscountByDiscountCode, getAllDiscounts } from '../../../services/DiscountService';
// import { updateOrder, getOrderByOrderId } from "../../../services/OrderService";
import { updateOrder } from "../../../services/OrderService";
import { getEmployeeInfo } from "../../../services/EmployeeService";
import LocalStorageService from '../../../services/LocalStorageService';
import { getOrderByOrderId, getAllOrderDetailByOrderId } from '../../../services/admin_services/OrderService';
// import "./../../../assets/Roboto/Roboto-Regular-normal.js"

function Pay({ cartItems, tableId, orderId, onQuantityChange }) {
    const [note, setNote] = useState(); // State để lưu ghi chú
    const [discountCode, setDiscountCode] = useState(); // State để lưu mã giảm giá
    const [existingDiscount, setExistingDiscount] = useState([]); // State để lưu mã giảm giá
    const [totalAmount, setTotalAmount] = useState(0); // State để lưu tổng số tiền
    const [beforeDiscount, setBeforeDiscount] = useState(); // State để lưu tổng số tiền
    const [discountValue, setDiscountValue] = useState(0); // State để luu tien giảm giá
    const [tableName, setTableName] = useState();
    const [areaName, setAreaName] = useState();
    const navigate = useNavigate();
    const employee = LocalStorageService.getItem("userLogged");
    const [order, setOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);

    useEffect(() => {
        fetchOrder();
    }, []);

    // Cập nhật tổng số tiền mỗi khi cartItems thay đổi
    useEffect(() => {
        const newTotal = calculateTotal();
        setTotalAmount(newTotal);
    }, [cartItems, existingDiscount]);

    useEffect(() => {
        fetchDiscount(discountCode);
    }, [discountCode]);

    // Tính tổng số tiền
    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + item.foodPrice * item.quantity, 0);
        setBeforeDiscount(subtotal);
        // Nếu đã tồn tại, tìm discount 
        // Áp dụng mã giảm giá nếu có
        let discount = 0;
        if (existingDiscount) {
            if (existingDiscount.discountType === 'PERCENT') {
                discount = (subtotal * existingDiscount.discountValue) / 100; // Giảm theo phần trăm
            } else if (existingDiscount.discountType === 'FIXED') {
                discount = existingDiscount.discountValue; // Giảm theo số tiền cố định
            }
        }
        setDiscountValue(discount);
        const total = subtotal - discount; // Tính tổng sau khi giảm giá
        setTotalAmount(total);
        return total < 0 ? 0 : total; // Đảm bảo tổng không âm
    };
    useEffect(() => {
        console.log("🛒 Cart Items:", cartItems);

        const duplicateItems = cartItems.filter((item, index, self) =>
            index !== self.findIndex((t) => t.foodId === item.foodId)
        );

        if (duplicateItems.length > 0) {
            console.warn("⚠️ Có món ăn trùng lặp trong giỏ hàng:", duplicateItems);
        }
    }, [cartItems]);


    const fetchDiscount = async () => {
        const check = await getAllDiscounts();
        const exist = check.data.result.find(dis => dis.discountCode === discountCode);
        if (exist) {
            setExistingDiscount(exist);
        }
        else {
            setExistingDiscount();
        }
    }

    const fetchComplteOrder = async () => {
        try {
            // Gọi API để cập nhật đơn hàng
            const order = {
                employeeId: employee.id,
                note: note,
                tableId: tableId,
                discountCode: discountCode
            }

            const response = await updateOrder(orderId, order);
            if (response.data.code == 200) {
                await completeOrder(orderId);
            }
        } catch (error) {
            if (error.response) {
                console.error("Lỗi từ server:", error.response.data);
            } else {
                console.error("Lỗi không xác định:", error.message);
            }
        }
    }

    const fetchOrder = async () => {
        const response = await getOrderByOrderId(orderId);
        setTableName(response.data.result.tableName);
        setAreaName(response.data.result.areaName);
    }
    // Trả về OrderResponse chứa { totalPrice, discountValue, … }
    const fetchCompleteAndGetOrder = async () => {
        // 1. Cập nhật đơn hàng (ghi note, mã giảm giá...)
        await updateOrder(orderId, {
            employeeId: employee.id,
            note,
            tableId,
            discountCode
        });

        // 2. Gọi completeOrder để backend tính totalPrice & discountValue
        const resp = await completeOrder(orderId);
        // Giả sử resp.data.result là OrderResponse
        return resp.data.result;
    };


    const fetchUpdateOrder = async () => {
        try {
            const order = {
                employeeId: employee.id,
                note: note,
                tableId: tableId,
                discountCode: discountCode,
            };

            const response = await updateOrder(orderId, order);
            if (response.data.code === 200) {
                await completeOrder(orderId); // 👈 Cập nhật trạng thái đơn hàng và bàn
            }
        } catch (error) {
            if (error.response) {
                console.error("Lỗi từ server:", error.response.data);
            } else {
                console.error("Lỗi không xác định:", error.message);
            }
        }
    }

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

    // const fetchOrderMe = async () => {
    //     try {
    //         const response = await getOrderByOrderId(orderId);
    //         console.log(response);
    //         // if (response.data.code === 200) {
    //         //     return response.data.result
    //         // }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // const fetchOrderDetail = async () => {
    //     try {
    //         const response = await getAllOrderDetailByOrderId(orderId);
    //         console.log(response);
    //         // if (response.data.code === 200) {
    //         //     return response.data.result;
    //         // }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };
    const fetchData = async () => {
        try {
            const [order, orderDetails] = await Promise.all([
                getOrderByOrderId(orderId),
                getAllOrderDetailByOrderId(orderId)
            ]);

            console.log(order, orderDetails);

            return {
                order: order.data?.result || null,
                orderDetails: orderDetails.data?.result || []
            };
        } catch (error) {
            console.log(error);
            return { order: null, orderDetails: [] };
        }
    };

    const handlePayment = async () => {

        navigate('/payment-method', {
            state: {
                orderId,
                tableId,
                note,
                discountCode,
                beforeDiscount,
                totalAmount
            }
        });

        // try {
        //     // 1️⃣ Cập nhật + hoàn tất và lấy luôn order mới
        //     const order = await fetchCompleteAndGetOrder();

        //     // 2️⃣ Lấy chi tiết món (orderDetails)
        //     const orderDetailsResp = await getAllOrderDetailByOrderId(orderId);
        //     const orderDetails = orderDetailsResp.data.result;

        //     // 3️⃣ In hóa đơn
        //     generateInvoice(order, orderDetails);

        //     notification.success({ message: 'Thanh toán thành công', duration: 2 });
        //     navigate('/');
        // } catch (err) {
        //     console.error('Lỗi thanh toán:', err);
        //     notification.error({ message: 'Thanh toán thất bại', duration: 2 });
        // }
    };

    function generateInvoice(order, orderDetails) {
        const doc = new jsPDF();

        // Tiêu đề
        doc.setFontSize(20);
        doc.text(VNToEN("HOA DON THANH TOAN"), 105, 20, { align: "center" });
        doc.setFontSize(15);
        doc.text(VNToEN("CUA HANG COFFEE NGUYEN XA"), 105, 30, { align: "center" });
        doc.text(VNToEN("-----------------------------------------------"), 105, 33, { align: "center" });

        // Thông tin chung
        doc.setFontSize(12);
        doc.text(`Ma hoa don: ${order.orderId}`, 20, 40);
        doc.text(`Nhan vien thanh toan: ${VNToEN(order.employeeName)}`, 20, 50);
        doc.text(`Khu vuc: ${VNToEN(order.areaName)} - ${VNToEN(order.tableName)}`, 20, 60);
        doc.text(`Thoi gian: ${new Date(order.createdAt).toLocaleString()}`, 20, 70);

        // Tiêu đề bảng
        let y = 90;
        doc.setFontSize(10);
        doc.text("STT", 20, y);
        doc.text(VNToEN("Ten mon"), 40, y);
        doc.text("SL", 120, y);
        doc.text(VNToEN("Don gia"), 140, y);
        doc.text(VNToEN("Thanh tien"), 170, y);

        // Vẽ đường kẻ
        doc.line(20, y + 5, 190, y + 5);
        y += 15;

        // Chi tiết món
        orderDetails.forEach((item, index) => {
            const total = item.quantity * item.foodPrice;
            doc.text(`${index + 1}`, 20, y);
            doc.text(VNToEN(item.foodName), 40, y);
            doc.text(`${item.quantity}`, 120, y);
            doc.text(item.foodPrice.toLocaleString(), 140, y);
            doc.text(total.toLocaleString(), 170, y);
            // if (item.foodNote) {
            //     y += 10;
            //     doc.text(`Ghi chu: ${VNToEN(item.foodNote)}`, 40, y);
            // }
            y += 10;
        });

        // Vẽ đường kẻ
        doc.line(20, y, 190, y);
        y += 10;

        // Tổng tiền gốc
        const originalTotal = orderDetails.reduce((sum, item) => sum + item.quantity * item.foodPrice, 0);

        // Tổng tiền
        doc.setFontSize(12);
        doc.text(VNToEN("Tong cong:"), 140, y);
        doc.text(`${originalTotal.toLocaleString()} VND`, 170, y);
        const dv = order.discountValue || 0;
        if (dv > 0) {
            y += 10;
            doc.text('Giam gia:', 140, y);
            doc.text(`- ${dv.toLocaleString()} VND`, 170, y);
        }

        y += 10;
        doc.text(VNToEN("Thanh tien:"), 140, y);
        doc.text(`${order.totalPrice.toLocaleString()} VND`, 170, y);

        // Lưu file
        doc.save(`HoaDon_${order.orderId}.pdf`);
    }

    const delOrder = async () => {
        try {
            await deleteOrder(orderId);
            notification.success({
                message: "Xoá đơn hàng thành công!"
            })
            navigate(-2);
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <div className='pay-container ml-1 font-bold flex-grow flex flex-col justify-between'>
                <div>
                    <div className='flex items-center text-2xl text-white bg-blue-500 border-b-2 border-gray-200 p-2'>
                        <img src={save} alt="Lưu" className='w-5 h-5' style={{ marginRight: '10px', borderRadius: '2px' }} />
                        <div>Giỏ hàng</div>
                        <div className='flex-grow'></div>
                        <Popconfirm
                            placement="bottomRight"
                            title="Xoá đơn hàng"
                            description="Bạn có muốn xoá đơn hàng không?"
                            okText="Xoá"
                            cancelText="Huỷ bỏ"
                            onConfirm={delOrder}
                        >
                            <img src={del} alt="Xóa" className='w-5 h-5' style={{ marginLeft: '10px', borderRadius: '2px' }} />
                        </Popconfirm>
                    </div>

                    {/* add foodpay component */}
                    {cartItems.map((item) => (
                        <FoodPay
                            key={item.foodId}
                            foodId={item.foodId}
                            foodName={item.foodName}
                            foodPrice={item.foodPrice}
                            quantity={item.quantity}
                            onQuantityChange={onQuantityChange}
                        />
                    ))}
                </div>

                <div >
                    {/* Phần ghi chú và mã giảm giá */}
                    <div className="bg-white p-2 border-b-2 border-t-2 border-gray-200">
                        <label className="block text-gray-700">Ghi chú</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú của bạn ở đây..."
                        />
                    </div>

                    <div className="bg-white p-2 border-b-2 border-gray-200">
                        <label className="block text-gray-700">Mã giảm giá</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Nhập mã giảm giá của bạn ở đây..."
                        />
                    </div>

                    {/* Hiển thị tổng số tiền */}
                    <button onClick={() => {
                        handlePayment();
                    }} className="bg-red-500 text-lg text-white p-2 w-full flex  justify-between" >
                        <span >Thanh toán</span>
                        {discountCode && (
                            <span style={{ textDecoration: "line-through" }}>{(beforeDiscount / 1000).toLocaleString()}K</span>
                        )}
                        <span>{totalAmount.toLocaleString()} VNĐ</span>
                    </button>

                </div>
            </div>
        </>
    );
}

export default Pay;
