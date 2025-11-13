# Quick Start - 5 Phút Setup

## Yêu Cầu
- ✅ Node.js 18+
- ✅ PostgreSQL đã cài đặt và đang chạy

## Setup Nhanh

### 1. Tạo Database
```bash
psql -U postgres
CREATE DATABASE employee_management;
\q
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env: thay your_password bằng password PostgreSQL của bạn
npm run setup
npm run dev
```

✅ Backend chạy tại: http://localhost:5000

### 3. Setup Frontend (Terminal mới)
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend chạy tại: http://localhost:3000

## Đăng Nhập

Mở http://localhost:3000 và đăng nhập:

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Nhân viên:**
- Email: `nhanvien1@example.com`
- Password: `employee123`

## Gặp Lỗi?

Xem hướng dẫn chi tiết tại: [SETUP.md](./SETUP.md)
