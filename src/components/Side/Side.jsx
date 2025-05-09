import React, { useState, useEffect } from 'react';
import { AppstoreOutlined, BuildOutlined, ShopOutlined, CalendarOutlined } from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { getAllArea } from '../../services/AreaService';
import { Link, useNavigate } from 'react-router-dom';
const { Sider } = Layout;
import '../../assets/Side/Side.css';

function Side() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await getAllArea();
      setAreas(response.data.result);
    } catch (error) {
      console.log('Error fetching areas: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy key của SubMenu (Khu vực)
  const getAllSubMenuKeys = (items) => {
    const keys = [];
    items.forEach((item) => {
      if (item.children) {
        keys.push(item.key);
      }
    });
    return keys;
  };

  // Chuyển khu vực thành các item có key là areaId
  const areaItems = Array.isArray(areas)
    ? areas.map((area) => ({
      key: `area-${area.areaId}`,
      label: area.areaName,
      icon: <BuildOutlined />,
    }))
    : [];

  const items = [
    {
      key: 'sale',
      label: (
        <Link to="/" className="menu-text" style={{ color: 'white', textDecoration: 'none' }}>
          Bán hàng
        </Link>
      ),
      className: 'menu-item',
    },
    {
      key: 'areas',
      label: 'Khu vực',
      icon: <AppstoreOutlined />,
      children: areaItems,
    },
    {
      key: 'menu',
      label: <Link to="/menu">Menu</Link>,
      icon: <ShopOutlined />,
    },
    {
      key: 'shift',
      label: (
        <Link to="/shift-monitor">
          <span style={{ color: '#F96E2A', fontWeight: 'bold' }}>Ca làm việc</span>
        </Link>
      ),
      icon: <CalendarOutlined style={{ color: '#F96E2A' }} />,
    },
  ];

  const [openKeys, setOpenKeys] = useState(getAllSubMenuKeys(items));

  // ✅ Xử lý navigate khi click item
  const handleClick = ({ key }) => {
    if (key.startsWith('area-')) {
      const areaId = key.replace('area-', '');
      navigate(`/areas/${areaId}`);
    }
  };

  return (
    <Sider style={{ height: '100vh', position: 'sticky', top: '0' }} collapsible>
      <Menu
        style={{ height: '100%' }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sale']}
        mode="inline"
        items={items}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={handleClick} // ✅ Bắt click ở đây
      />
    </Sider>
  );
}

export default Side;
