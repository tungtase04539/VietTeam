# Hướng Dẫn Cài Đặt Chi Tiết

## Yêu Cầu Hệ Thống

- Node.js 18+ ([Tải tại đây](https://nodejs.org/))
- PostgreSQL 13+ ([Tải tại đây](https://www.postgresql.org/download/))
- npm (đi kèm với Node.js)

## Bước 1: Kiểm Tra PostgreSQL

Trước tiên, đảm bảo PostgreSQL đang chạy:

### Windows
```bash
# Kiểm tra service
sc query postgresql

# Hoặc mở Services.msc và tìm PostgreSQL
```

### macOS
```bash
# Kiểm tra status
brew services list | grep postgresql

# Start nếu chưa chạy
brew services start postgresql
```

### Linux
```bash
# Kiểm tra status
sudo systemctl status postgresql

# Start nếu chưa chạy
sudo systemctl start postgresql
```

## Bước 2: Tạo Database

Mở terminal PostgreSQL và tạo database:

```bash
# Mở psql
psql -U postgres

# Trong psql, chạy lệnh:
CREATE DATABASE employee_management;

# Thoát psql
\q
```

## Bước 3: Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

### Chỉnh sửa file `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Lưu ý:** Thay `your_password` bằng mật khẩu PostgreSQL của bạn

### Chạy migrations và seed data:

```bash
# Generate Prisma Client
npx prisma generate

# Chạy migrations (tạo tables)
npx prisma migrate dev --name init

# Seed data (tạo tài khoản mẫu)
npm run prisma:seed
```

### Hoặc dùng script setup tự động:

```bash
npm run setup
```

### Chạy backend server:

```bash
npm run dev
```

Bạn sẽ thấy: `Server đang chạy tại http://localhost:5000`

## Bước 4: Setup Frontend

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env (optional - đã có default)
cp .env.example .env
```

### Chạy frontend:

```bash
npm run dev
```

Bạn sẽ thấy: `Local: http://localhost:3000`

## Bước 5: Đăng Nhập

Mở trình duyệt và truy cập: http://localhost:3000

### Tài khoản đã được tạo sẵn:

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Nhân viên:**
- Email: `nhanvien1@example.com`
- Password: `employee123`

## Khắc Phục Lỗi Thường Gặp

### Lỗi: "Connection refused" hoặc "ECONNREFUSED"

**Nguyên nhân:** PostgreSQL chưa chạy

**Giải pháp:**
```bash
# Kiểm tra và start PostgreSQL (xem Bước 1)
```

### Lỗi: "password authentication failed"

**Nguyên nhân:** Sai mật khẩu PostgreSQL trong file .env

**Giải pháp:**
1. Kiểm tra mật khẩu PostgreSQL của bạn
2. Cập nhật `DATABASE_URL` trong file `backend/.env`
3. Restart backend server

### Lỗi: "database employee_management does not exist"

**Nguyên nhân:** Chưa tạo database

**Giải pháp:**
```bash
psql -U postgres
CREATE DATABASE employee_management;
\q
```

### Lỗi: "Prisma schema not found"

**Nguyên nhân:** Chưa generate Prisma Client

**Giải pháp:**
```bash
cd backend
npx prisma generate
```

### Lỗi: "Cannot find module '@prisma/client'"

**Nguyên nhân:** Chưa cài đặt dependencies hoặc chưa generate Prisma

**Giải pháp:**
```bash
cd backend
npm install
npx prisma generate
```

### Lỗi: "Port 5000 already in use"

**Nguyên nhân:** Port 5000 đã được sử dụng bởi ứng dụng khác

**Giải pháp:**
1. Tắt ứng dụng đang dùng port 5000
2. Hoặc thay đổi port trong `backend/.env`:
```env
PORT=5001
```
3. Và cập nhật frontend `.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### Lỗi frontend: "Network Error" hoặc "Failed to fetch"

**Nguyên nhân:** Backend chưa chạy hoặc sai URL

**Giải pháp:**
1. Đảm bảo backend đang chạy tại http://localhost:5000
2. Kiểm tra file `frontend/.env` có đúng `VITE_API_URL`
3. Restart frontend server

### Lỗi: "Table does not exist"

**Nguyên nhân:** Chưa chạy migrations

**Giải pháp:**
```bash
cd backend
npx prisma migrate dev --name init
```

## Kiểm Tra Setup Thành Công

### Test Backend:

```bash
# Test health check
curl http://localhost:5000/api/health

# Kết quả mong đợi:
{"status":"OK","message":"Server is running"}
```

### Test Database:

```bash
cd backend
npx prisma studio
```

Mở http://localhost:5555 để xem dữ liệu trong database

## Các Lệnh Hữu Ích

### Backend:

```bash
npm run dev              # Chạy development server
npm run prisma:studio    # Mở Prisma Studio
npm run prisma:seed      # Seed data mới
npm run setup            # Setup tự động (install + migrate + seed)
```

### Frontend:

```bash
npm run dev              # Chạy development server
npm run build            # Build production
npm run preview          # Preview production build
```

## Cần Trợ Giúp?

Nếu vẫn gặp lỗi, hãy:

1. Kiểm tra terminal backend có log lỗi gì không
2. Kiểm tra browser console (F12) có lỗi gì không
3. Đảm bảo đã làm đúng tất cả các bước trên
4. Restart lại cả backend và frontend

## Video Hướng Dẫn

[TODO: Thêm link video nếu có]

## Liên Hệ

[TODO: Thêm thông tin liên hệ]
