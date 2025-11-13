# Quick Deploy - 10 Phút

Hướng dẫn nhanh deploy lên Vercel + Supabase trong 10 phút.

## Bước 1: Tạo Database Supabase (3 phút)

1. Vào https://supabase.com → **New Project**
2. Điền:
   - Name: `employee-management`
   - Password: `[TẠO PASSWORD MẠNH VÀ GHI NHỚ]`
   - Region: Singapore
3. Đợi project khởi tạo
4. Vào **Settings** → **Database** → **Connection string**
5. Copy 2 URLs:
   - **URI mode** (pooling): `postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
   - **Session mode** (direct): `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

## Bước 2: Deploy Backend (3 phút)

1. Vào https://vercel.com/new
2. Import repository `VietTeam`
3. **Root Directory**: `backend`
4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true

   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

   JWT_SECRET=[RANDOM_STRING_32_CHARS]

   JWT_EXPIRES_IN=7d

   NODE_ENV=production
   ```
5. Click **Deploy**
6. Copy URL backend: `https://xxx.vercel.app`

## Bước 3: Tạo Tables trong Supabase (2 phút)

1. Vào Supabase → **SQL Editor**
2. Paste và chạy SQL:

```sql
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" DEFAULT 'EMPLOYEE' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

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

## Bước 4: Deploy Frontend (2 phút)

1. Vào https://vercel.com/new
2. Import repository `VietTeam`
3. **Root Directory**: `frontend`
4. **Framework**: Vite
5. **Environment Variables**:
   ```
   VITE_API_URL=https://[YOUR-BACKEND].vercel.app/api
   ```
6. Click **Deploy**
7. Copy URL frontend: `https://xxx.vercel.app`

## Bước 5: Tạo Admin Account

### Option 1: Dùng curl
```bash
curl -X POST https://[YOUR-BACKEND].vercel.app/api/auth/register \
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

### Option 2: Dùng Postman
POST `https://[YOUR-BACKEND].vercel.app/api/auth/register`

Body:
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN",
  "firstName": "Admin",
  "lastName": "User",
  "position": "Manager",
  "department": "IT"
}
```

## ✅ Hoàn Thành!

Truy cập: `https://[YOUR-FRONTEND].vercel.app`

Đăng nhập:
- Email: `admin@example.com`
- Password: `admin123`

---

## Tạo JWT Secret

Dùng lệnh sau để tạo JWT secret mạnh:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Hoặc truy cập
https://generate-secret.vercel.app/32
```

---

## Troubleshooting

### Backend deploy fail?
- Kiểm tra `DATABASE_URL` có đúng không
- Kiểm tra Supabase password

### Frontend không kết nối được backend?
- Kiểm tra `VITE_API_URL` có đúng URL backend không
- Thêm `FRONTEND_URL` vào backend environment variables
- Redeploy backend

### Không tạo được admin?
- Test backend health: `https://[BACKEND]/api/health`
- Kiểm tra tables đã tạo trong Supabase chưa

---

Xem hướng dẫn chi tiết: [DEPLOY_VERCEL_SUPABASE.md](./DEPLOY_VERCEL_SUPABASE.md)
