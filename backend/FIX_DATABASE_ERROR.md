# Hướng Dẫn Sửa Lỗi Database Connection

## Lỗi bạn đang gặp:
```
Authentication failed against database server at `localhost`,
the provided database credentials for `user` are not valid.
```

## Nguyên nhân:
File `.env` của bạn có thông tin đăng nhập PostgreSQL không đúng.

## Giải pháp từng bước:

### Bước 1: Tìm file `.env` trong thư mục backend

Mở file này bằng Notepad hoặc VS Code:
```
C:\Users\Admin\Desktop\VietTeam-claude-create-new-feature-011CV5a9q8TAmFi3GaGTDU92\main\backend\.env
```

### Bước 2: Xóa hết nội dung cũ và thay bằng một trong các options sau:

---

#### **OPTION 1: PostgreSQL username là `postgres`, password là `postgres`** (Phổ biến nhất)

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

#### **OPTION 2: PostgreSQL username là `postgres`, KHÔNG CÓ password**

```env
PORT=5000
DATABASE_URL="postgresql://postgres@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

#### **OPTION 3: PostgreSQL username là `postgres`, password là `admin`**

```env
PORT=5000
DATABASE_URL="postgresql://postgres:admin@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

#### **OPTION 4: PostgreSQL username là `postgres`, password là `root`**

```env
PORT=5000
DATABASE_URL="postgresql://postgres:root@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

#### **OPTION 5: Tự điền password của bạn**

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/employee_management?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Thay `YOUR_PASSWORD_HERE` bằng mật khẩu PostgreSQL của bạn**

---

### Bước 3: Kiểm tra password PostgreSQL của bạn

#### Cách 1: Thử đăng nhập bằng psql

Mở Command Prompt (CMD) và thử:

```bash
# Thử với password "postgres"
psql -U postgres -W
# Nhập password: postgres

# Hoặc thử không password
psql -U postgres

# Hoặc thử password "admin"
psql -U postgres -W
# Nhập password: admin
```

Nếu đăng nhập được nghĩa là password đúng!

#### Cách 2: Mở pgAdmin

1. Mở **pgAdmin 4** (ứng dụng quản lý PostgreSQL)
2. Khi kết nối, nó sẽ hỏi password
3. Nhớ password đó và dùng trong file `.env`

#### Cách 3: Reset password PostgreSQL (nếu quên)

```bash
# Mở psql với quyền superuser
psql -U postgres

# Đặt lại password
ALTER USER postgres PASSWORD 'postgres';

# Thoát
\q
```

---

### Bước 4: Tạo Database (nếu chưa có)

```bash
# Mở psql
psql -U postgres

# Tạo database
CREATE DATABASE employee_management;

# Kiểm tra database đã tạo
\l

# Thoát
\q
```

---

### Bước 5: Sau khi sửa file .env

1. **LƯU file `.env`** (Ctrl + S)

2. **Chạy lại migration:**

```bash
cd backend
npx prisma migrate dev --name init
```

3. **Nếu thành công, chạy seed:**

```bash
npm run prisma:seed
```

4. **Khởi động lại server:**

```bash
npm run dev
```

---

## Kiểm tra file .env đúng chưa:

File `.env` của bạn **PHẢI CÓ** format:

```
postgresql://USERNAME:PASSWORD@localhost:5432/employee_management?schema=public
```

Trong đó:
- `USERNAME`: thường là `postgres`
- `PASSWORD`: mật khẩu PostgreSQL của bạn (hoặc bỏ qua nếu không có password)
- `localhost:5432`: server PostgreSQL (thường không cần đổi)
- `employee_management`: tên database

---

## Các lỗi thường gặp:

### ❌ SAI:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/employee_management?schema=public"
```
→ `user` không phải username mặc định của PostgreSQL

### ✅ ĐÚNG:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/employee_management?schema=public"
```
→ `postgres` là username mặc định

---

## Vẫn không được?

### Debug thêm:

1. **Kiểm tra PostgreSQL có đang chạy không:**

Mở Task Manager (Ctrl + Shift + Esc) → tìm process `postgres.exe`

Hoặc:

```bash
sc query postgresql-x64-14
# (số 14 có thể khác tùy version)
```

2. **Kiểm tra port 5432 có đang được dùng không:**

```bash
netstat -ano | findstr :5432
```

3. **Thử kết nối trực tiếp:**

```bash
psql -U postgres -h localhost -d employee_management
```

Nếu kết nối được là database ok!

---

## Cần trợ giúp?

Hãy chụp màn hình nội dung file `.env` của bạn (che mật khẩu nếu có) và gửi cho tôi!
