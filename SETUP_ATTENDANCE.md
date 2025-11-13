# Setup Hệ Thống Chấm Công - QUAN TRỌNG!

## ⚠️ Bước 1: Chạy Migration trên Supabase (BẮT BUỘC)

Backend đã được update với tables mới, nhưng **BẠN CẦN CHẠY MIGRATION thủ công trên Supabase**.

### Cách chạy:

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (icon database bên trái)
4. Copy toàn bộ nội dung file: `backend/prisma/migrations/add_attendance_worklogs.sql`
5. Paste vào SQL Editor
6. Click **RUN** (hoặc Ctrl/Cmd + Enter)

### Kiểm tra migration thành công:

Sau khi chạy, kiểm tra:
- Tables mới: `attendances`, `work_logs`
- Enums mới: `AttendanceStatus`, `WorkLogStatus`

Nếu có lỗi "already exists", có nghĩa là đã chạy rồi → OK!

## ⚠️ Bước 2: Redeploy Backend trên Vercel

Backend code đã được push lên git. Vercel sẽ tự động deploy.

**Kiểm tra deployment:**
1. Vào https://vercel.com/dashboard
2. Chọn project **viet-team** (backend)
3. Tab **Deployments** → Đợi status = "Ready"
4. Click vào deployment → Xem Runtime Logs
5. Không có errors → OK!

### Test APIs mới:

```bash
# Check health
curl https://viet-team.vercel.app/api/health

# Test attendance endpoint (sẽ trả về 401 nếu chưa auth - đúng!)
curl https://viet-team.vercel.app/api/attendance/today
```

## Bước 3: Đợi Frontend Update

Frontend UI đang được develop. Sau khi xong sẽ có:
- Employee: Check-in/out buttons, work log form
- Admin: Real-time dashboard với statistics

## Nếu gặp lỗi

### Lỗi "relation attendances does not exist"
→ Chưa chạy migration. Quay lại Bước 1.

### Lỗi "404 Not Found" khi call API
→ Backend chưa deploy. Đợi Vercel deployment xong.

### Lỗi "500 Internal Server Error"
→ Check Vercel Runtime Logs để xem lỗi chi tiết.

## Sau khi setup xong

Backend APIs sẵn sàng:
- ✅ Check-in/out
- ✅ Attendance tracking
- ✅ Work logs
- ✅ Admin statistics

Chờ frontend UI để sử dụng! 🚀
