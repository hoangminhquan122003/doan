// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Ant Design
import { ConfigProvider } from "antd";
import locale from "antd/locale/vi_VN"; // hoặc en_US nếu dùng tiếng Anh

// Day.js
import dayjs from "dayjs";
import "dayjs/locale/vi"; // hoặc "en" nếu dùng tiếng Anh
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";

dayjs.locale("vi"); // hoặc "en"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      locale={locale}
      datePicker={dayjsGenerateConfig} // ép dùng Day.js
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);

