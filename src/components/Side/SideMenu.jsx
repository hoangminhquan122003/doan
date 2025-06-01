import React, { useState, useEffect } from 'react';
import { AppstoreOutlined, CoffeeOutlined, LeftOutlined, RobotOutlined } from '@ant-design/icons';
import { Menu, Layout, Modal, Input, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import food from '../../assets/fast-food.png';
import '../../assets/Side/Side.css';
import { getAllCategories } from '../../services/CategoryService';
import { sendMessage } from '../../services/ChatService';  // Import ChatService
import { message } from 'antd';
import { Link } from 'react-router-dom';


const { Sider } = Layout;

function Side({ onCategoryClick }) {
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const showAiModal = () => {
    setIsAiModalVisible(true);
  };
  const items = [
    {
      key: 'back',
      label: (
        <Link to="/" style={{ fontWeight: 'bold', color: 'white' }}>
          Quay lại
        </Link>
      ),
      icon: < LeftOutlined style={{ color: 'white', fontWeight: 'bold' }} />,
      className: 'menu-item',
    },
    {
      key: 'category',
      label: 'Thể loại món',
      icon: <AppstoreOutlined />,
      children: Array.isArray(categories) ? categories.map((category) => ({
        key: category.categoryId,
        label: category.name,
        icon: <img src={food} alt="Category Item Icon" style={{ width: '16px', height: '16px' }} />,
        onClick: () => onCategoryClick(category.categoryId) // Thêm sự kiện onClick
      })) : []
    },
    // Thêm mục gợi ý món
    {
      key: 'ai-suggestion',
      label: 'Gợi ý món ăn từ AI',
      icon: <RobotOutlined />,
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response.data.result);
    } catch (error) {
      console.log('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal khi nhấn vào "Gợi ý món ăn từ AI"


  // Đóng modal
  const handleAiCancel = () => {
    setIsAiModalVisible(false);
    setSuggestedItems([]); // reset món gợi ý
    setAiPrompt('');
  };

  // Gợi ý món ăn từ AI
  const handleAiSuggest = async () => {
    if (!aiPrompt.trim()) {
      message.warning('Vui lòng nhập mô tả của khách để gợi ý món ăn.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await sendMessage(aiPrompt);
      console.log("Phản hồi từ AI:", response);

      const content = response?.data?.content || ''; // Lấy nội dung từ phản hồi
      const suggestions = content
        .split(/[\n,]/) // Tách chuỗi theo dấu xuống dòng và dấu phẩy
        .map((item, index) => {
          const parts = item.split(':'); // Tách tên món và giá
          if (parts.length < 2) {
            return null; // Nếu không có giá trị hợp lệ, trả về null
          }

          const name = parts[0]?.trim();
          const priceStr = parts[1]?.trim();

          // Kiểm tra giá trị giá có hợp lệ không
          const price = priceStr ? parseInt(priceStr.replace(/\D/g, '')) : 0;
          if (!name || price <= 0) {
            return null; // Nếu tên món trống hoặc giá không hợp lệ, bỏ qua món này
          }

          return {
            id: index,
            name: name || 'Món ăn chưa rõ', // Nếu không có tên món, dùng giá trị mặc định
            price: price || 0, // Nếu không có giá, dùng giá trị mặc định
          };
        })
        .filter(item => item !== null); // Loại bỏ các món không hợp lệ

      console.log("Món gợi ý:", suggestions); // Kiểm tra giá trị món ăn
      setSuggestedItems(suggestions);
    } catch (error) {
      console.log('Lỗi gợi ý món:', error);
      message.error('Không thể lấy gợi ý món ăn từ AI.');
    } finally {
      setIsLoading(false);
    }
  };


  // Hàm thêm món vào giỏ hàng
  const addToCart = (item) => {
    console.log('Thêm món vào giỏ hàng:', item);

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };


  return (
    <Sider style={{ height: '100vh', position: 'fixed', top: '100px' }}>
      <Menu
        style={{ height: '100%' }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sale']}
        mode="inline"
        items={items}
        onClick={({ key }) => {
          if (key === 'ai-suggestion') {
            showAiModal();
            return;
          }
          const category = categories.find(cat => cat.categoryId === key);
          if (category) {
            onCategoryClick(category.categoryId);
          }
        }}
      />

      {/* Modal Gợi ý món ăn */}
      <Modal
        title="Gợi ý món ăn từ mô tả của khách"
        open={isAiModalVisible}
        onCancel={handleAiCancel}
        footer={null}
      >
        <Input.TextArea
          placeholder="Nhập mô tả của khách (ví dụ: thích ngọt, có đá, ăn nhẹ...)"
          rows={4}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleAiSuggest}
          loading={isLoading}
          style={{ marginTop: 16 }}
        >
          Gợi ý món
        </Button>

        {Array.isArray(suggestedItems) && suggestedItems.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Món được gợi ý:</h4>
            <ul>
              {suggestedItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - {item.price}K
                  {/* <Button type="link" onClick={() => addToCart(item)}>
                    Thêm
                  </Button> */}
                </li>
              ))}
            </ul>
          </div>
        )}

      </Modal>
    </Sider>
  );
}

export default Side;
