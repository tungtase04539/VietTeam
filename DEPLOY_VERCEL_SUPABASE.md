# Hướng Dẫn Deploy lên Vercel + Supabase

Hướng dẫn chi tiết deploy ứng dụng Quản lý Nhân viên lên Vercel với database Supabase (PostgreSQL).

---

## 📋 Chuẩn Bị

- ✅ Tài khoản GitHub (để connect với Vercel)
- ✅ Tài khoản Vercel (miễn phí): https://vercel.com
- ✅ Tài khoản Supabase (miễn phí): https://supabase.com

---

## PHẦN 1: Setup Supabase Database

### Bước 1: Tạo Project Supabase

1. Truy cập https://supabase.com và đăng nhập
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: `employee-management` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (GHI NHỚ PASSWORD NÀY!)
   - **Region**: Chọn gần Việt Nam nhất (ví dụ: Singapore)
4. Click **"Create new project"**
5. Đợi 1-2 phút để Supabase khởi tạo database

### Bước 2: Lấy Database Connection String

1. Trong Supabase Dashboard, vào **Settings** (biểu tượng ⚙️) → **Database**
2. Scroll xuống phần **"Connection string"**
3. Chọn tab **"URI"** (không phải Session mode)
4. Copy connection string, nó có dạng:
   ```
   postgresql://postgres.xxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
5. **QUAN TRỌNG**: Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo ở Bước 1

### Bước 3: Lấy Direct Connection (cho migrations)

1. Vẫn ở trang **Database settings**
2. Tìm phần **"Connection string"**
3. Chọn tab **"Session mode"** hoặc **"Direct connection"**
4. Copy direct URL, có dạng:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### ✅ Bạn cần 2 connection strings:
- **DATABASE_URL**: Dùng connection pooling (URI mode) - Cho production
- **DIRECT_URL**: Direct connection - Cho chạy migrations

---

## PHẦN 2: Deploy Backend lên Vercel

### Bước 1: Push Code lên GitHub

```bash
# Nếu chưa có remote repository
git remote add origin https://github.com/YOUR_USERNAME/VietTeam.git

# Push code
git add .
git commit -m "feat: Add Vercel deployment config"
git push -u origin main
```

### Bước 2: Import Project vào Vercel

1. Truy cập https://vercel.com/new
2. Click **"Import Git Repository"**
3. Chọn repository `VietTeam` của bạn
4. **QUAN TRỌNG**: Trong **"Configure Project"**:
   - **Root Directory**: Chọn `backend`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build` (hoặc để trống)
   - **Output Directory**: `dist` (hoặc để trống)

### Bước 3: Thêm Environment Variables

Trong phần **Environment Variables**, thêm các biến sau:

```
DATABASE_URL
postgresql://postgres.xxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true

DIRECT_URL
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres

JWT_SECRET
your_very_strong_random_secret_minimum_32_characters_long

JWT_EXPIRES_IN
7d

NODE_ENV
production
```

**⚠️ LƯU Ý:**
- Thay `[YOUR-PASSWORD]` bằng password Supabase của bạn
- Tạo JWT_SECRET mạnh (có thể dùng: https://generate-secret.vercel.app/32)
- Click **"Add"** sau mỗi biến

### Bước 4: Deploy

1. Click **"Deploy"**
2. Đợi Vercel build và deploy (2-3 phút)
3. Sau khi deploy xong, bạn sẽ có URL dạng:
   ```
   https://your-backend-project.vercel.app
   ```

### Bước 5: Chạy Database Migrations trên Supabase

**Cách 1: Dùng local với DIRECT_URL**

```bash
cd backend

# Tạo file .env.production
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres"
JWT_SECRET=your_jwt_secret
NODE_ENV=production
EOF

# Chạy migration
npx dotenv -e .env.production -- npx prisma migrate deploy

# Hoặc (nếu migrate deploy không work)
npx dotenv -e .env.production -- npx prisma db push

# Seed data (tạo admin mặc định)
npx dotenv -e .env.production -- npx prisma db seed
```

**Cách 2: Dùng Supabase SQL Editor**

1. Vào Supabase Dashboard → **SQL Editor**
2. Copy nội dung SQL từ `backend/prisma/migrations/` hoặc tự tạo tables:

```sql
-- Tạo enum Role
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- Tạo bảng users
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" DEFAULT 'EMPLOYEE' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Tạo bảng employees
CREATE TABLE "employees" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "position" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "salary" DOUBLE PRECISION,
  "hireDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

3. Click **"Run"** để tạo tables

### Bước 6: Test Backend

Mở URL backend của bạn trong browser:
```
https://your-backend-project.vercel.app/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","message":"Server is running"}
```

✅ Backend đã deploy thành công!

---

## PHẦN 3: Deploy Frontend lên Vercel

### Bước 1: Import Frontend Project

1. Vào https://vercel.com/new
2. Click **"Import Git Repository"**
3. Chọn lại repository `VietTeam`
4. **Root Directory**: Chọn `frontend`
5. **Framework Preset**: `Vite`

### Bước 2: Thêm Environment Variables

Thêm biến sau:

```
VITE_API_URL
https://your-backend-project.vercel.app/api
```

**⚠️ QUAN TRỌNG**: Thay `your-backend-project` bằng URL backend thực tế của bạn

### Bước 3: Deploy

1. Click **"Deploy"**
2. Đợi build xong (1-2 phút)
3. Bạn sẽ có URL frontend:
   ```
   https://your-frontend-project.vercel.app
   ```

### Bước 4: Cập nhật CORS

Quay lại Backend project:
1. Vào **Settings** → **Environment Variables**
2. Thêm biến mới:
   ```
   FRONTEND_URL
   https://your-frontend-project.vercel.app
   ```
3. **Redeploy** backend

---

## PHẦN 4: Tạo Tài Khoản Admin Đầu Tiên

### Cách 1: Dùng Seed Script

```bash
# Local với .env.production
cd backend
npx dotenv -e .env.production -- npm run prisma:seed
```

### Cách 2: Đăng ký qua API

Dùng Postman hoặc curl:

```bash
curl -X POST https://your-backend-project.vercel.app/api/auth/register \
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

### Cách 3: Tạo trực tiếp trong Supabase

1. Vào Supabase Dashboard → **Table Editor**
2. Chọn bảng `users`
3. Click **"Insert row"**
4. Điền thông tin (password phải hash bằng bcrypt trước)

---

## 🎉 Hoàn Thành!

Bây giờ bạn có thể:

1. **Truy cập ứng dụng**: `https://your-frontend-project.vercel.app`
2. **Đăng nhập** với tài khoản admin vừa tạo
3. **Test** các tính năng

### URLs quan trọng:

- 🌐 **Frontend**: `https://your-frontend-project.vercel.app`
- 🔧 **Backend API**: `https://your-backend-project.vercel.app/api`
- 🗄️ **Supabase Dashboard**: `https://app.supabase.com`
- 📊 **Vercel Dashboard**: `https://vercel.com/dashboard`

---

## 🔧 Troubleshooting

### Lỗi: "Database connection failed"

**Giải pháp:**
1. Kiểm tra `DATABASE_URL` trong Vercel Environment Variables
2. Đảm bảo password Supabase đúng
3. Thử connect từ local:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

### Lỗi: "CORS error" trên frontend

**Giải pháp:**
1. Thêm `FRONTEND_URL` vào backend environment variables
2. Cập nhật CORS config trong `backend/src/server.ts`:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```
3. Redeploy backend

### Lỗi: "404 Not Found" trên các routes

**Giải pháp:**
1. Kiểm tra `vercel.json` có đúng config không
2. Đảm bảo frontend có rewrite rules

### Database tables chưa được tạo

**Giải pháp:**
1. Chạy migrations từ local với DIRECT_URL
2. Hoặc tạo tables thủ công trong Supabase SQL Editor

---

## 📚 Tài Liệu Thêm

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## 🔄 Update Ứng Dụng

Khi bạn thay đổi code:

```bash
git add .
git commit -m "feat: your changes"
git push
```

Vercel sẽ tự động deploy lại cả frontend và backend! 🚀

---

## 💰 Chi Phí

- **Vercel Free Plan**:
  - Unlimited personal projects
  - 100GB bandwidth/month
  - Serverless functions

- **Supabase Free Plan**:
  - 500MB database
  - 2GB file storage
  - 50,000 monthly active users

Hoàn toàn miễn phí cho development và testing! 🎉
