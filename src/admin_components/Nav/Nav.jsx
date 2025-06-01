import React from 'react'
import { LogoutOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Popconfirm, Space } from 'antd';
import LocalStorageService from '../../services/LocalStorageService';
import { logout } from '../../services/AuthService';

export const Nav = () => {
    const handleLogout = async () => {
        try {
            const token = { token: LocalStorageService.getItem("token") };
            await logout(token);
        } catch (error) {
            console.log(error);
        } finally {
            LocalStorageService.clear();
            window.location.href = "/login";
        }

    }
    const userLogged = LocalStorageService.getItem("userLogged");
    return (
        <div className='flex h-14 items-center space-x-4 p-2 justify-end border-b border-gray-200 bg-gray-50'>
            <div className='flex-grow text-center text-xl font-bold'>Trang Quản Trị</div>
            <div>
                <h4 className='font-bold'>{userLogged.fullName}</h4>
                <p className='text-xs font-light text-right'>ROLE: {userLogged.role}</p>
            </div>
            <Avatar
                src="https://scontent.fhan14-2.fna.fbcdn.net/v/t39.30808-1/395397729_1161909258547130_1266242785814037444_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeGpIkRMQVVvnmwH2ofpr7TkEKVcz64R3E8QpVzPrhHcT1TKP5-1J8Hf70ubU908-QdxTxW8eZD6YxaqZiZRL_Me&_nc_ohc=0gI3IscPKEMQ7kNvwHaLM3O&_nc_oc=Adklmnm7sgxJl3kNm0msmED50AP7ojVxZIP8FhH3qp4Zxmu36yNUKCpJy74cwScoDHI&_nc_zt=24&_nc_ht=scontent.fhan14-2.fna&_nc_gid=OLuIlwZi5aybtJa-pNJJ3w&oh=00_AfIipRxtpzLoztyPG9kpGfJmqFmgI165iyVsD1psG1ZXgA&oe=68420E37"
                size={50}
            />

            <Popconfirm
                onConfirm={handleLogout}
                placement="bottomRight"
                title={"Đăng xuất"}
                description={"Bạn có muốn đăng xuất không?"}
                okText="Đồng ý"
                cancelText="Không"
                icon={<QuestionCircleOutlined
                    style={{
                        color: 'green',
                    }}
                />}
            >
                <Button
                    type="dashed"
                    color='danger'
                    icon={<LogoutOutlined />}
                >
                    Đăng xuất
                </Button>
            </Popconfirm>
        </div>
    )
}
