# Khắc Phục Lỗi Đăng Nhập và Đăng Ký

## Vấn Đề
- Đăng nhập và đăng ký thất bại dù nhập đúng tài khoản, mật khẩu
- Nguyên nhân: Chưa có tables trong database Supabase

## Giải Pháp

### BƯỚC 1: Tạo Tables trong Supabase

1. Vào **Supabase Dashboard**: https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (icon database bên trái)
4. Copy và paste file `backend/create-tables.sql`, rồi click **Run**

### BƯỚC 2: Tạo Demo Accounts

Có 2 cách:

**Cách 1: Dùng SQL (Nhanh)**
- Copy và chạy file `backend/seed-data.sql` trong Supabase SQL Editor

**Cách 2: Dùng Script Node.js (Khuyến nghị)**
```bash
cd backend
npm install
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
node seed.js
```

### BƯỚC 3: Kiểm Tra Environment Variables

Đảm bảo các biến sau đã được cấu hình trong Vercel:

```
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your_very_strong_random_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### BƯỚC 4: Redeploy Vercel

```bash
# Commit changes
git add .
git commit -m "fix: Add database setup scripts and auth fix"
git push origin claude/fix-auth-issues-011CV5iHDiPqtYbcNRsqwcTS

# Hoặc force redeploy trên Vercel Dashboard
```

### BƯỚC 5: Test Đăng Nhập

Sử dụng tài khoản demo:
- **Admin**: `admin@example.com` / `admin123`
- **Employee**: `nhanvien1@example.com` / `employee123`

## Lưu ý Quan Trọng

1. **Password trong DATABASE_URL**: Nếu password có ký tự đặc biệt (`@`, `#`, etc.), cần encode:
   - `@` → `%40`
   - `#` → `%23`
   - Ví dụ: `Anhtung1998@` → `Anhtung1998%40`

2. **Prisma Generate Issue**: Nếu gặp lỗi download Prisma engines:
   ```bash
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
   ```

3. **Local Development**: Cấu hình file `.env` trong `backend/` và `frontend/`:
   ```bash
   # backend/.env
   DATABASE_URL="your-supabase-database-url"
   DIRECT_URL="your-supabase-direct-url"
   JWT_SECRET=your_jwt_secret

   # frontend/.env
   VITE_API_URL=http://localhost:5000/api
   ```

## Xác Minh

Sau khi hoàn tất, kiểm tra:
- [ ] Tables đã được tạo trong Supabase (users, employees)
- [ ] Demo accounts đã được seed
- [ ] Vercel deployment thành công
- [ ] Có thể đăng nhập với tài khoản demo
- [ ] Có thể đăng ký tài khoản mới

## Hỗ Trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra Vercel deployment logs
2. Kiểm tra Supabase logs
3. Xác nhận DATABASE_URL đúng format
4. Đảm bảo password được encode đúng cách
