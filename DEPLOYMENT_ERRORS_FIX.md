# Sửa Lỗi Deploy - Vercel + Supabase

Hướng dẫn sửa các lỗi thường gặp khi deploy lên Vercel.

---

## ❌ Lỗi 1: Frontend Build Error

### Triệu chứng:
```
error TS6133: 'formatDate' is declared but its value is never read.
error TS2339: Property 'env' does not exist on type 'ImportMeta'.
Error: Command "npm run build" exited with 2
```

### Nguyên nhân:
1. Có function được khai báo nhưng không sử dụng
2. TypeScript không nhận ra `import.meta.env` của Vite

### ✅ Giải pháp:
**Đã được fix trong commit mới nhất!**

Nếu bạn vẫn gặp lỗi, hãy:

1. **Pull code mới nhất:**
```bash
git pull origin claude/create-new-feature-011CV5a9q8TAmFi3GaGTDU92
```

2. **Redeploy frontend trong Vercel:**
- Vào Vercel Dashboard → Your Frontend Project
- Click **"Deployments"**
- Click **"..."** trên deployment mới nhất
- Chọn **"Redeploy"**

### Chi tiết các fix:
- ✅ Xóa `formatDate` không được sử dụng trong `AdminDashboard.tsx`
- ✅ Thêm `"types": ["vite/client"]` vào `tsconfig.json`
- ✅ Tạo `src/vite-env.d.ts` với định nghĩa `ImportMetaEnv`

---

## ❌ Lỗi 2: Backend "This Serverless Function has crashed"

### Triệu chứng:
```
500 Internal Server Error
This Serverless Function has crashed
```

### Nguyên nhân:
1. Vercel serverless cần entry point đúng cách
2. Prisma client chưa được generated trong build
3. Missing environment variables
4. Database connection issues

### ✅ Giải pháp:

#### Bước 1: Redeploy với code mới
**Code đã được fix!** Pull code mới nhất:

```bash
git pull origin claude/create-new-feature-011CV5a9q8TAmFi3GaGTDU92
```

#### Bước 2: Kiểm tra Environment Variables trong Vercel

Vào **Vercel Dashboard** → **Your Backend Project** → **Settings** → **Environment Variables**

Đảm bảo có đủ các biến sau:

```
DATABASE_URL
postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true

DIRECT_URL
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

JWT_SECRET
[YOUR_RANDOM_SECRET_32_CHARS]

JWT_EXPIRES_IN
7d

NODE_ENV
production
```

**⚠️ QUAN TRỌNG**: Phải có cả `DATABASE_URL` VÀ `DIRECT_URL`!

#### Bước 3: Chạy Migrations trên Supabase

**Option 1: Dùng Supabase SQL Editor** (Khuyến nghị)

1. Vào Supabase Dashboard → **SQL Editor**
2. Chạy SQL sau để tạo tables:

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

-- Tạo indexes
CREATE INDEX "employees_userId_idx" ON "employees"("userId");
```

**Option 2: Dùng Prisma Migrate từ local**

```bash
cd backend

# Tạo file .env.production với DIRECT_URL từ Supabase
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
EOF

# Chạy migrations
npx dotenv -e .env.production -- npx prisma migrate deploy

# Hoặc dùng db push (nhanh hơn)
npx dotenv -e .env.production -- npx prisma db push
```

#### Bước 4: Redeploy Backend

1. Vào Vercel Dashboard → Backend Project
2. Click **"Deployments"**
3. Chọn **"Redeploy"** hoặc push code mới:

```bash
git add .
git commit -m "fix: Apply deployment fixes"
git push
```

Vercel sẽ tự động deploy lại.

#### Bước 5: Test Backend

Mở URL backend trong browser:
```
https://your-backend-project.vercel.app/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","message":"Server is running"}
```

✅ Backend đã chạy thành công!

---

## 📋 Checklist Deploy Thành Công

### Backend:
- [ ] Code mới nhất đã được pull/push
- [ ] Environment variables đầy đủ (DATABASE_URL, DIRECT_URL, JWT_SECRET, etc.)
- [ ] Database tables đã được tạo trong Supabase
- [ ] `/api/health` trả về `{"status":"OK"}`

### Frontend:
- [ ] Code mới nhất đã được pull/push
- [ ] `VITE_API_URL` đã được set đúng URL backend
- [ ] Build thành công (không có TypeScript errors)
- [ ] Có thể truy cập frontend URL

---

## 🔍 Debug Thêm

### Xem Logs Backend trên Vercel:

1. Vào Vercel Dashboard → Backend Project
2. Click **"Deployments"**
3. Click vào deployment đang chạy
4. Click **"View Function Logs"**

### Xem Logs Frontend trên Vercel:

1. Vào Vercel Dashboard → Frontend Project
2. Click **"Deployments"**
3. Click vào deployment đang chạy
4. Xem **"Build Logs"**

### Test Database Connection từ Local:

```bash
# Test connection với Supabase
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Hoặc dùng script test
cd backend
npm run test:db
```

---

## 🆘 Vẫn Gặp Lỗi?

### Lỗi: "Prisma Client not found"

**Giải pháp:**
- Đảm bảo `postinstall` script có trong `package.json`
- Redeploy project

### Lỗi: "Database connection timeout"

**Giải pháp:**
- Kiểm tra `DATABASE_URL` có đúng không
- Kiểm tra password Supabase
- Thử connect từ local để test credentials

### Lỗi: "Table does not exist"

**Giải pháp:**
- Chạy lại SQL tạo tables trong Supabase SQL Editor
- Hoặc run migrations từ local

### Lỗi CORS trên Frontend

**Giải pháp:**
1. Thêm `FRONTEND_URL` vào backend environment variables:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
2. Redeploy backend

---

## 📚 Chi Tiết Các Thay Đổi

### Backend Changes:

1. **Tạo `api/index.ts`**: Entry point cho Vercel serverless
2. **Cập nhật `vercel.json`**: Point đúng entry file
3. **Thêm `postinstall` script**: Auto-generate Prisma client
4. **Cập nhật `schema.prisma`**: Thêm `directUrl` cho migrations
5. **Thêm `vercel-build` script**: Run migrations khi deploy

### Frontend Changes:

1. **Xóa unused `formatDate`**: Fix TypeScript error
2. **Thêm `vite/client` types**: Fix `import.meta.env` error
3. **Tạo `vite-env.d.ts`**: Định nghĩa types cho Vite

---

## ✅ Sau Khi Fix

Ứng dụng của bạn sẽ:
- ✅ Deploy thành công trên Vercel
- ✅ Backend chạy ổn định với Supabase
- ✅ Frontend build không lỗi
- ✅ Database connections hoạt động
- ✅ APIs hoạt động bình thường

Giờ bạn có thể test ứng dụng online! 🎉

---

## 🔗 Links Hữu Ích

- [Vercel Docs - Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
