import { Button, Empty, Modal, Popconfirm, Select, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTable, getTablesByAreaId, updateTable } from '../../../services/admin_services/TableService';
import { ModalCreateTable } from './ModalCreateTable';

export const MangeTable = () => {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const [dataTables, setDataTables] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);
    const hanldeCreateTable = () => setIsModalOpen(true);

    const confirmDelete = async (tableId) => {
        try {
            const response = await deleteTable(tableId);
            if (response.data.code === 200) {
                fetchTables();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTables = async () => {
        try {
            const response = await getTablesByAreaId(areaId);
            if (response.data.code === 200) {
                setDataTables(response.data.result);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleChangeStatus = async (tableId, newStatus) => {
        try {
            const currentTable = dataTables.find((t) => t.tableId === tableId);
            if (!currentTable) return;

            // ❌ Không cho phép chuyển từ UNAVAILABLE sang MAINTENANCE
            if (currentTable.status === 'UNAVAILABLE' && newStatus === 'MAINTENANCE') {
                notification.warning({
                    message: 'Bàn đang được sử dụng!',
                    description: 'Không thể chuyển bàn sang trạng thái bảo trì khi đang có khách.',
                    duration: 2,
                });
                return;
            }

            // ❌ Không cho phép admin set sang AVAILABLE hoặc UNAVAILABLE thủ công
            if (newStatus === 'AVAILABLE' || newStatus === 'UNAVAILABLE') {
                notification.warning({
                    message: 'Không được phép!',
                    description: 'Admin chỉ được chuyển bàn sang "Bảo trì" hoặc hủy bảo trì.',
                    duration: 2,
                });
                return;
            }

            // ✅ Cho phép chuyển sang bảo trì nếu bàn không phải đang dùng
            const updatedTable = {
                ...currentTable,
                status: newStatus
            };

            const response = await updateTable(tableId, updatedTable);
            if (response.data.code === 200) {
                fetchTables();
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        }
    };


    const handleCancelMaintenance = async (tableId) => {
        try {
            const currentTable = dataTables.find((t) => t.tableId === tableId);
            if (!currentTable || currentTable.status !== 'MAINTENANCE') return;

            // Chuyển bàn từ Bảo trì về Sẵn sàng
            const updatedTable = {
                ...currentTable,
                status: 'AVAILABLE'
            };
            console.log('khong chuyen đc')

            const response = await updateTable(tableId, updatedTable);
            console.log('lolololo')

            if (response.data.code === 200) {
                fetchTables();
            }
            console.log('lolo1lolo1')
        } catch (error) {
            console.error("Lỗi khi hủy bảo trì:", error);
        }
    };

    useEffect(() => {
        fetchTables();
    }, [areaId]);

    useEffect(() => {
        document.title = "Quản lý bàn ăn";
    }, []);

    return (
        <div>
            <div className='flex border-b p-2 justify-between'>
                <Button onClick={() => navigate(-1)}>Trở về</Button>
                <Button onClick={hanldeCreateTable}>Tạo bàn ăn mới</Button>
            </div>

            <div className='p-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:lg:grid-cols-4 gap-5 justify-items-center'>
                {dataTables.map((table) => (
                    <div key={table.tableId} className="flex flex-col items-center gap-2">
                        <div
                            className={`border rounded-lg w-64 h-32 shadow flex flex-col justify-between p-2
                                ${table.status === "AVAILABLE" ? "bg-[#FFF]" :
                                    table.status === "UNAVAILABLE" ? "bg-[#3CD19D]" :
                                        table.status === "MAINTENANCE" ? "bg-[#F46F5E]" :
                                            "bg-[#CCC]"}
                            `}
                        >
                            <div>
                                <h3 className='font-semibold'>{table.tableName}</h3>
                                <p>{table.description}</p>
                            </div>
                            <div className="flex justify-end">
                                <Popconfirm
                                    title="Xoá bàn ăn"
                                    description="Bạn có muốn xoá bàn này không?"
                                    onConfirm={() => confirmDelete(table.tableId)}
                                    okText="Đồng ý xoá"
                                    cancelText="Từ chối"
                                >
                                    <Button danger size="small">Xoá</Button>
                                </Popconfirm>
                            </div>
                        </div>

                        {/* Nếu bàn đang ở trạng thái Bảo trì, hiển thị nút hủy bảo trì */}
                        {table.status === 'MAINTENANCE' && (
                            <Button
                                danger
                                size="small"
                                onClick={() => handleCancelMaintenance(table.tableId)}
                            >
                                Hủy bảo trì
                            </Button>
                        )}

                        <Select
                            defaultValue={table.status}
                            style={{ width: 160 }}
                            onChange={(value) => handleChangeStatus(table.tableId, value)}
                            options={[
                                { value: 'MAINTENANCE', label: 'Bảo trì' },
                                { value: 'AVAILABLE', label: 'Sẵn sàng' }, // Admin không thể chọn này
                                { value: 'UNAVAILABLE', label: 'Đang dùng' }, // Admin không thể chọn này
                            ]}
                            disabled={table.status === 'MAINTENANCE'} // Chỉ cho phép admin chuyển bàn từ Bảo trì sang Sẵn sàng
                        />
                    </div>
                ))}
            </div>

            <Modal
                title="Tạo bàn mới"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <ModalCreateTable
                    areaId={areaId}
                    handleCancel={handleCancel}
                    fetchTables={fetchTables}
                />
            </Modal>
        </div>
    );
};
