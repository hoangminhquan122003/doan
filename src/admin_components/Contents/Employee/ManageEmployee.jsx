import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, Table, Tag } from 'antd';
import { getAllEmployee } from '../../../services/EmployeeService';
import { ModalActionEmployee } from './ModalActionEmployee';
import { ModalWorkInfoEmployee } from './ModalWorkInfoEmployee';

export const ManageEmployee = () => {
    useEffect(() => {
        document.title = "Quản lý nhân viên";
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkInfoModalOpen, setIsWorkInfoModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [employeeDetail, setEmployeeDetail] = useState(null);
    const [workInfoEmployee, setWorkInfoEmployee] = useState(null);

    // Gọi API lấy danh sách nhân viên
    const fetchEmployees = async () => {
        try {
            const response = await getAllEmployee();
            if (response.data.code === 200) {
                setData(response.data.result);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleEdit = (id) => {
        const selected = data.find(e => e.id === id);
        setEmployeeDetail(selected);
        setIsModalOpen(true);
    };

    const handleWorkInfo = (id) => {
        const selected = data.find(e => e.id === id);
        setWorkInfoEmployee(selected);
        setIsWorkInfoModalOpen(true);
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            align: 'center',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            align: 'center',
        },
        {
            title: 'Quyền',
            dataIndex: 'role',
            key: 'role',
            align: 'center',
            render: (role) => {
                const color = role === 'ADMIN' ? 'rgb(219 39 119)' : role === 'EMPLOYEE' ? 'rgb(14 165 233)' : 'black';
                return <span style={{ color }}>{role}</span>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const config = {
                    ACTIVE: { color: 'green', text: 'Đã kích hoạt' },
                    INACTIVE: { color: 'red', text: 'Chưa kích hoạt' },
                }[status] || { color: 'gray', text: 'Không hoạt động' };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'id',
            key: 'actions',
            align: 'center',
            render: (id) => (
                <Space direction="vertical">
                    <Button onClick={() => handleEdit(id)}>Chỉnh sửa</Button>
                    <Button onClick={() => handleWorkInfo(id)}>Thông tin làm việc</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className='flex border-b p-2'>
                <p className='flex-grow ml-2 text-2xl'>Quản lý nhân viên</p>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ position: ['bottomCenter'], pageSize: 8 }}
            />

            {/* Modal chỉnh sửa nhân viên */}
            <Modal
                title="Thông tin nhân viên"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={600}
                footer={null}
            >
                {employeeDetail && (
                    <ModalActionEmployee
                        setIsModalOpen={setIsModalOpen}
                        employeeDetail={employeeDetail}
                        fetchEmployees={fetchEmployees}
                    />
                )}
            </Modal>

            {/* Modal thông tin làm việc */}
            <Modal
                title="Thông tin làm việc"
                open={isWorkInfoModalOpen}
                onCancel={() => setIsWorkInfoModalOpen(false)}
                width={700}
                footer={null}
            >
                {workInfoEmployee && (
                    <ModalWorkInfoEmployee
                        employeeDetail={workInfoEmployee}
                        setIsWorkInfoModalOpen={setIsWorkInfoModalOpen}
                    />
                )}
            </Modal>
        </div>
    );
};
