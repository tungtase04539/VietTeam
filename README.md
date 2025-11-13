# Hệ Thống Quản Lý Nhân Viên

Ứng dụng web quản lý nhân viên với phân quyền Admin và Employee, được xây dựng bằng React, TypeScript, Node.js, Express và PostgreSQL.

## Tính năng

### Chung
- 🔐 Đăng nhập/Đăng ký với JWT Authentication
- 🔒 Phân quyền dựa trên Role (Admin, Employee)
- 📱 Giao diện responsive với Tailwind CSS

### Admin
- 👥 Xem danh sách tất cả nhân viên
- ✏️ Chỉnh sửa thông tin nhân viên
- 🗑️ Xóa nhân viên
- 📊 Quản lý đầy đủ thông tin: họ tên, email, chức vụ, phòng ban, lương, v.v.

### Employee (Nhân viên)
- 👤 Xem thông tin cá nhân
- 📋 Xem chức vụ, phòng ban, lương

## Công nghệ sử dụng

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios

## Cài đặt

### Yêu cầu
- Node.js 18+ và npm
- PostgreSQL 13+

### 1. Clone repository

```bash
git clone <repository-url>
cd VietTeam
```

### 2. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Tạo database và chạy migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Chạy backend server
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

### 3. Cài đặt Frontend

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env
```

File `.env` frontend (mặc định không cần chỉnh sửa):

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Chạy frontend server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Sử dụng

### 1. Tạo tài khoản Admin đầu tiên

Để tạo tài khoản Admin, bạn có 2 cách:

**Cách 1: Sử dụng Prisma Studio**

```bash
cd backend
npx prisma studio
```

Mở Prisma Studio tại http://localhost:5555, tạo User với role = "ADMIN"

**Cách 2: Đăng ký qua API**

Sử dụng Postman hoặc curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User",
    "position": "Manager",
    "department": "IT"
  }'
```

### 2. Đăng nhập

Truy cập http://localhost:3000/login và đăng nhập với tài khoản vừa tạo.

### 3. Sử dụng ứng dụng

- **Admin**: Sau khi đăng nhập, bạn sẽ thấy dashboard với danh sách nhân viên, có thể thêm/sửa/xóa nhân viên
- **Employee**: Sau khi đăng nhập, bạn sẽ thấy thông tin cá nhân của mình

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (yêu cầu authentication)

### Employees (yêu cầu authentication)

- `GET /api/employees` - Lấy danh sách tất cả nhân viên
- `GET /api/employees/:id` - Lấy thông tin một nhân viên
- `PUT /api/employees/:id` - Cập nhật nhân viên (chỉ Admin)
- `DELETE /api/employees/:id` - Xóa nhân viên (chỉ Admin)

## Cấu trúc dự án

```
VietTeam/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Prisma client config
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Authentication logic
│   │   │   └── employeeController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── employeeRoutes.ts
│   │   ├── utils/
│   │   │   └── jwt.ts             # JWT utilities
│   │   └── server.ts              # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.tsx   # Protected route component
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── EmployeeDashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts             # API service
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## Scripts hữu ích

### Backend

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm start            # Chạy production server
npm run prisma:studio    # Mở Prisma Studio
npm run prisma:migrate   # Chạy database migrations
```

### Frontend

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
```

## Bảo mật

- Mật khẩu được hash bằng bcryptjs trước khi lưu vào database
- JWT token được sử dụng cho authentication
- Protected routes với middleware authentication
- Role-based access control (RBAC)

## Tài khoản demo

Sau khi setup, bạn có thể tạo các tài khoản sau để test:

**Admin:**
- Email: admin@example.com
- Password: admin123

**Employee:**
- Đăng ký qua trang /register

## Ghi chú

- Đảm bảo PostgreSQL đang chạy trước khi start backend
- Backend phải chạy trước khi start frontend
- Thay đổi JWT_SECRET trong file .env của backend trước khi deploy production

## License

MIT
