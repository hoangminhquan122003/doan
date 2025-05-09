import React, { useEffect, useState } from "react";
import { Table, Button, Switch, Modal, notification, Popconfirm } from "antd";
import { getAllDiscount, updateDiscount, deleteDiscount } from "../../../services/admin_services/DiscountService";
import { ModalCreateDiscount } from "./ModalCreateDiscount";
import { ModalupdateDiscount } from "./ModalUpdateDiscount";

export const ManageDiscount = () => {
    const [data, setData] = useState([]);
    const [discountUpdate, setDiscountUpdate] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch discount data
    const fetchDiscount = async () => {
        setLoading(true); // Bắt đầu loading
        try {
            const response = await getAllDiscount();
            if (response.data.code === 200) {
                setData(response.data.result);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    useEffect(() => {
        document.title = "Quản lý mã giảm giá";
        fetchDiscount();
    }, []);

    // Handle modal closing
    const handleCancel = () => {
        setIsModalOpen(false);
        setIsModalUpdateOpen(false);
    };

    // Handle status change (active/inactive)
    const handleStatusChange = async (discountCode, newStatus) => {
        try {
            await updateDiscount(discountCode, { status: newStatus });
            fetchDiscount();
        } catch (err) {
            console.error('Lỗi cập nhật status:', err);
            fetchDiscount();
        }
    };

    // Handle delete discount
    const handleDeleteDiscount = async (discountCode) => {
        setLoading(true); // Start loading
        try {
            const response = await deleteDiscount(discountCode);
            if (response.data.code === 200) {
                notification.success({ message: "Xóa mã giảm giá thành công" });
                // Update the local data by filtering out the deleted discount
                setData(prevData => prevData.filter(item => item.discountCode !== discountCode));
            } else {
                notification.error({ message: "Xóa thất bại" });
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            notification.error({ message: "Xóa thất bại" });
        } finally {
            setLoading(false); // End loading
        }
    };


    const columns = [
        {
            title: "Mã giảm giá",
            dataIndex: "discountCode",
            key: "discountCode",
            align: "center",
        },
        {
            title: "Loại mã giảm giá",
            dataIndex: "discountType",
            key: "discountType",
            align: "center",
        },
        {
            title: "Giá trị",
            dataIndex: "discountValue",
            key: "discountValue",
            align: "center",
            render: (value, record) =>
                record.discountType === "PERCENT" ? `${value}%` : `${value.toLocaleString()} VND`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (_, record) => (
                <Switch
                    checked={record.status}
                    onChange={(checked) => handleStatusChange(record.discountCode, checked)}
                />
            ),
        },
        {
            title: "Hoạt động",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <div>
                    <Button
                        onClick={() => {
                            setDiscountUpdate(record);
                            setIsModalUpdateOpen(true);
                        }}
                        style={{ marginRight: 8 }}
                    >
                        Chỉnh sửa mã giảm giá
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteDiscount(record.discountCode)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger loading={loading}>Xóa</Button> {/* Hiển thị loading khi xóa */}
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className='flex border-b p-2'>
                <p className='flex-grow ml-2 text-2xl'>Quản lý mã giảm giá</p>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>Tạo mới Discount</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="discountCode" loading={loading} />
            <Modal title="Create Discount" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <ModalCreateDiscount handleCancel={handleCancel} fetchDiscount={fetchDiscount} />
            </Modal>
            <Modal title="Update Discount" open={isModalUpdateOpen} onCancel={handleCancel} footer={null}>
                <ModalupdateDiscount discountUpdate={discountUpdate} handleCancel={handleCancel} fetchDiscount={fetchDiscount} />
            </Modal>
        </div>
    );
};
