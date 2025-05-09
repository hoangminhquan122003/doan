import BASE_URL from './HTTPService';  // Import BASE_URL từ HTTPService

export const getQRInfo = (orderId) => {
    // Gọi API để lấy thông tin QR chuyển khoản
    return BASE_URL.get(`/payment/qr-info/${orderId}`);
};
