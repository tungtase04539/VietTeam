# 🎥 Chạy Migration cho Video Feature

## ⚠️ QUAN TRỌNG

Trước khi sử dụng tính năng upload video, bạn PHẢI chạy migration để thêm các fields video vào database.

---

## 🚀 Cách 1: Supabase SQL Editor (Production)

### Bước 1: Vào Supabase Dashboard
```
https://supabase.com/dashboard
```

### Bước 2: Chọn Project
Click vào project **VietTeam** của bạn

### Bước 3: Mở SQL Editor
1. Click **"SQL Editor"** ở menu bên trái
2. Click **"New query"**

### Bước 4: Chạy Migration SQL

Copy và paste đoạn SQL này:

```sql
-- Add video fields to work_logs table
ALTER TABLE "work_logs"
ADD COLUMN IF NOT EXISTS "videoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "videoFileId" TEXT,
ADD COLUMN IF NOT EXISTS "videoFileName" TEXT;

-- Add comments
COMMENT ON COLUMN "work_logs"."videoUrl" IS 'Google Drive shareable link to video';
COMMENT ON COLUMN "work_logs"."videoFileId" IS 'Google Drive file ID';
COMMENT ON COLUMN "work_logs"."videoFileName" IS 'Original uploaded filename';

-- Verify columns added (run this to check)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'work_logs' 
AND column_name IN ('videoUrl', 'videoFileId', 'videoFileName')
ORDER BY column_name;
```

### Bước 5: Run Query
- Click nút **"Run"** (góc dưới bên phải)
- Hoặc nhấn **Ctrl + Enter**

### Bước 6: Kiểm tra kết quả
Bạn sẽ thấy bảng với 3 dòng:
```
videoFileId   | text | YES
videoFileName | text | YES  
videoUrl      | text | YES
```

✅ **Nếu thấy 3 dòng này = Migration thành công!**

---

## 💻 Cách 2: Local Development

### Nếu chạy local database:

```bash
cd backend
npx prisma migrate dev --name add_video_fields_to_worklog
```

Prisma sẽ tự động:
- Tạo migration file
- Chạy migration
- Update Prisma Client

---

## ✅ Sau khi chạy xong:

### Test ngay:
1. Login với tài khoản employee
2. Thêm công việc mới
3. Upload video test
4. Manager vào tab Videos → Thấy video ✅

---

## 🔍 Kiểm tra nếu có lỗi:

### Lỗi: "column already exists"
→ Migration đã chạy rồi, OK ✅

### Lỗi: "permission denied"
→ Kiểm tra database permissions trong Supabase

### Lỗi khác:
→ Copy error message và hỏi developer

---

## 📦 Migration File Location

File SQL migration có sẵn tại:
```
backend/prisma/migrations/add_video_fields_to_worklog.sql
```

Bạn có thể mở file này để xem SQL commands.

