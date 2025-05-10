import React from "react";
import { useState, useEffect } from "react";
import { Menu, Layout } from "antd";
const { Header } = Layout;
import logo from '../../assets/logo.jfif';
import avatar from '../../assets/avatar.jpg';
import { getEmployeeInfo } from '../../services/EmployeeService';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { logout } from "../../services/AuthService";
import LocalStorageService from "../../services/LocalStorageService";
import Swal from 'sweetalert2';
import { Modal } from 'antd';



function Nav() {
    //get real time
    const [currentTime, setCurrentTime] = useState(new Date());
    const [info, setInfo] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Cập nhật mỗi giây

        // Hủy timer khi component bị gỡ bỏ
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchInfo();
    }, []);

    const handleLogout = async (navigate) => {
        const result = await Swal.fire({
            title: 'Bạn chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        });

        // Nếu người dùng xác nhận
        if (result.isConfirmed) {
            try {
                const token = { token: LocalStorageService.getItem("token") };
                await logout(token); // Gọi API logout
            } catch (error) {
                console.log(error);
            } finally {
                LocalStorageService.clear(); // Xoá token và thông tin người dùng
                navigate('/login'); // Điều hướng về trang đăng nhập
            }
        }
    };

    const fetchInfo = async () => {
        const response = await getEmployeeInfo();
        setInfo(response.data.result);
    }

    const currentDate = currentTime.toLocaleDateString(); // Lấy ngày tháng năm
    const currentClock = currentTime.toLocaleTimeString(); // Lấy giờ phút giây
    const navigate = useNavigate();

    return (
        <Header style={{ backgroundColor: 'white', padding: '20px 0px', height: "100px" }}>
            <div className="logo" />
            <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
                <Menu.Item key="logo" disabled style={{ cursor: 'default' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ height: '40px', marginRight: '16px' }} // Tùy chỉnh kích thước logo
                        />
                        <h3 style={{ fontWeight: "bold" }}>Coffee Phúc An</h3>
                    </Link>
                </Menu.Item>


                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <p style={{ height: '20px', fontSize: '16px', fontWeight: 'bolder' }}>{currentDate}</p>
                    <p style={{ height: '20px' }} className="flex justify-center">{currentClock}</p>
                </div>

                <div className="flex ms-auto" onClick={showModal} style={{ cursor: 'pointer' }}>
                    <div>
                        <p style={{ height: '20px', fontSize: '16px', fontWeight: 'bolder' }}>{info.fullName}</p>
                        <p style={{ height: '20px' }} className="flex justify-end">{info.role}</p>
                    </div>
                    <div className="flex items-center">
                        <img
                            src={avatar}
                            alt="Avatar"
                            style={{ height: '40px', marginRight: '16px', marginLeft: '10px', borderRadius: '50%' }}
                        />
                    </div>




                    {/* <div className="flex items-center">
                        <Button
                            style={{ marginRight: '15px', backgroundColor: '#F96E2A' }}
                            type="primary"
                            onClick={() => handleLogout(navigate)} // Gọi hàm handleLogout khi nhấn nút
                        >
                            Đăng xuất
                        </Button>
                    </div> */}

                </div>
                <Modal
                    title={<h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Thông tin cá nhân</h2>}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={avatar}
                            alt="Avatar"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '20px',
                                border: '2px solid #1890ff',
                            }}
                        />
                        <div style={{ width: '100%' }}>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                                <strong>👤 ID:</strong> {info.id}
                            </p>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                                <strong>👤 Họ tên:</strong> {info.fullName}
                            </p>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                                <strong>💼 Chức vụ:</strong> {info.role}
                            </p>
                        </div>

                    </div>
                </Modal>


            </Menu>
        </Header>
    );
};

export default Nav;