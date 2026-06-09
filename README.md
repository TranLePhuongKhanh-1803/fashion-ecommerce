# Fashion E-Commerce Website

Website bán hàng thời trang hiện đại với Backend PHP MVC và Frontend ReactJS.

## 🏗️ Kiến trúc

- **Backend**: PHP thuần theo mô hình MVC
- **Frontend**: ReactJS + Vite
- **Database**: MySQL
- **API**: RESTful API (JSON)
- **UI**: TailwindCSS

## 📁 Cấu trúc dự án

```
fashion-ecommerce/
├── backend/
│   ├── app/
│   │   ├── config/         # Cấu hình
│   │   ├── controllers/    # Controllers
│   │   ├── core/           # Core classes (Database, Router, etc.)
│   │   └── models/         # Models
│   ├── public/             # Entry point
│   └── database.sql        # Database schema
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # Context API
    │   ├── pages/          # Pages
    │   ├── services/       # API services
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🚀 Hướng dẫn Setup

### 1. Backend (PHP)

#### Yêu cầu:
- PHP >= 7.4
- MySQL >= 5.7
- Apache với mod_rewrite (hoặc PHP built-in server)

#### Các bước:

1. **Cấu hình Database:**
   - Tạo database MySQL
   - Chỉnh sửa file `backend/app/config/config.php`:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', '');
     define('DB_NAME', 'fashion_ecommerce');
     ```

2. **Import Database:**
   ```bash
   mysql -u root -p fashion_ecommerce < backend/database.sql
   ```
   Hoặc sử dụng phpMyAdmin để import file `backend/database.sql`

3. **Chạy Backend:**
   
   **Cách 1: Sử dụng PHP built-in server (khuyến nghị để test)**
   ```bash
   cd backend/public
    
   ```
   
   **Cách 2: Sử dụng Apache/XAMPP**
   - Copy folder `backend` vào `htdocs`
   - Cấu hình virtual host trỏ đến `backend/public`
   - Truy cập: `http://localhost:8000`

4. **Kiểm tra Backend:**
   - Mở trình duyệt: `http://localhost:8000/api/products`
   - Nếu thấy JSON response là thành công

### 2. Frontend (React)

#### Yêu cầu:
- Node.js >= 16.x
- npm hoặc yarn

#### Các bước:

1. **Cài đặt dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Chạy development server:**
   ```bash
   npm run dev
   ```

3. **Truy cập website:**
   - Mở trình duyệt: `http://localhost:5173`

4. **Build production:**
   ```bash
   npm run build
   ```

## 🔐 Tài khoản Demo

- **Email:** `user@example.com`
- **Password:** `password123`

## 📡 API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `GET /api/products/featured` - Lấy sản phẩm nổi bật
- `GET /api/products/category/{category}` - Lấy sản phẩm theo danh mục

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm sản phẩm vào giỏ hàng
- `PUT /api/cart/{id}` - Cập nhật số lượng
- `DELETE /api/cart/{productId}` - Xóa sản phẩm khỏi giỏ hàng
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng

## 🎨 Tính năng

### Frontend
- ✅ Trang chủ với hero section và featured products
- ✅ Trang shop với lọc và tìm kiếm
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng (thêm, xóa, cập nhật)
- ✅ Đăng nhập / Đăng ký
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Context API cho state management

### Backend
- ✅ MVC architecture
- ✅ RESTful API
- ✅ Authentication với session
- ✅ Password hashing (bcrypt)
- ✅ CORS support
- ✅ Error handling
- ✅ Database queries với PDO

## 🔧 Cấu hình

### Backend Config (`backend/app/config/config.php`):
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'fashion_ecommerce');
define('BASE_URL', 'http://localhost:8000');
define('FRONTEND_URL', 'http://localhost:5173');
```

### Frontend API (`frontend/src/services/api.js`):
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 📝 Ghi chú

- Đảm bảo MySQL đang chạy trước khi start backend
- CORS đã được cấu hình để frontend có thể gọi API
- Backend sử dụng session để authentication
- Frontend sử dụng Context API để quản lý state

## 🐛 Troubleshooting

1. **Lỗi kết nối database:**
   - Kiểm tra MySQL đang chạy
   - Kiểm tra thông tin trong `config.php`

2. **Lỗi CORS:**
   - Kiểm tra `FRONTEND_URL` trong `config.php` khớp với URL frontend

3. **Lỗi route không tìm thấy:**
   - Kiểm tra `.htaccess` đã được enable
   - Hoặc sử dụng PHP built-in server

4. **Lỗi npm install:**
   - Xóa `node_modules` và `package-lock.json`
   - Chạy lại `npm install`

## 📄 License

MIT License

---

**Happy Coding! 🎉**
