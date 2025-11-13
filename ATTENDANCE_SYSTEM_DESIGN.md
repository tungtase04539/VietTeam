# Hệ Thống Chấm Công & Theo Dõi Công Việc Từ Xa

## Tổng quan

Hệ thống cho phép nhân viên làm việc từ xa chấm công hàng ngày và ghi lại công việc đã làm. Admin có dashboard tổng hợp để theo dõi toàn bộ team.

## Database Schema

### Attendance (Chấm công)
- `id`: UUID
- `employeeId`: Foreign key to Employee
- `date`: Ngày chấm công
- `checkInTime`: Thời gian vào
- `checkOutTime`: Thời gian ra
- `totalHours`: Tổng giờ làm (tự động tính)
- `status`: PRESENT | LATE | ABSENT | HALF_DAY | WORK_FROM_HOME
- `notes`: Ghi chú

**Logic:**
- Mỗi nhân viên 1 record/ngày (unique constraint)
- Check-in sau 9:00 → status = LATE
- totalHours = checkOutTime - checkInTime

### WorkLog (Nhật ký công việc)
- `id`: UUID
- `employeeId`: Foreign key to Employee
- `date`: Ngày làm việc
- `title`: Tiêu đề công việc
- `description`: Mô tả chi tiết
- `hoursSpent`: Số giờ dành cho task này
- `status`: TODO | IN_PROGRESS | COMPLETED | BLOCKED

## Backend APIs

### Attendance APIs

#### Employee Endpoints
- **POST `/api/attendance/check-in`** - Check-in bắt đầu làm
  - Body: `{ notes?: string }`
  - Response: Attendance record
  - Auto-detect LATE status if after 9 AM

- **POST `/api/attendance/check-out`** - Check-out kết thúc làm
  - Body: `{ notes?: string }`
  - Response: Attendance record with totalHours calculated

- **GET `/api/attendance/today`** - Xem chấm công hôm nay
  - Response: Today's attendance or null

- **GET `/api/attendance/my-records`** - Lịch sử chấm công cá nhân
  - Query: `startDate?, endDate?, limit?`
  - Response: Attendances + statistics (total days, hours, attendance rate)

#### Admin Endpoints
- **GET `/api/attendance/all`** - Xem tất cả chấm công
  - Query: `startDate?, endDate?, employeeId?, status?`
  - Response: All attendance records with employee info

- **GET `/api/attendance/summary`** - Dashboard statistics
  - Response:
    - Today: checked in count, checked out, late, attendance rate
    - This month: total hours, average hours/day
    - Department stats
    - Real-time attendance list

### WorkLog APIs

#### Employee Endpoints
- **POST `/api/work-logs`** - Tạo work log mới
  - Body: `{ title, description?, hoursSpent?, status?, date? }`

- **GET `/api/work-logs/my-logs`** - Xem work logs của mình
  - Query: `startDate?, endDate?, status?, limit?`
  - Response: Work logs + statistics (completion rate, total hours)

- **PUT `/api/work-logs/:id`** - Cập nhật work log
- **DELETE `/api/work-logs/:id`** - Xóa work log

#### Admin Endpoints
- **GET `/api/work-logs/all`** - Xem tất cả work logs
  - Query: `startDate?, endDate?, employeeId?, status?, limit?`

- **GET `/api/work-logs/stats`** - Thống kê work logs
  - Response:
    - Overall: total logs, hours, completion rate
    - Employee stats: breakdown by employee
    - Department stats: breakdown by department

## Frontend Design

### Employee Dashboard

#### Check-in/Check-out Section
- Prominent button với status hiện tại
- Hiển thị:
  - ✅ Đã check-in hôm nay (giờ vào, tổng giờ đã làm live)
  - ⏰ Chưa check-in (nút check-in lớn)
  - ✅ Đã check-out (tổng giờ làm hôm nay)

#### Work Log Section
- Form nhanh thêm công việc
- List công việc hôm nay với status badges
- Quick actions: Mark as completed, edit, delete

#### Statistics Cards
- Tháng này: Tổng giờ làm, số ngày đi làm
- Tuần này: Attendance rate, average hours/day
- Charts: Attendance calendar heatmap

### Admin Dashboard

#### Overview Stats (Top cards)
- Total employees
- Checked in today / Total (real-time)
- Average hours this month
- Attendance rate this month

#### Real-time Attendance
- List nhân viên đang online (checked in, chưa checkout)
- Show check-in time và hours worked
- Filter by department

#### Attendance Records Table
- Paginated table với filters:
  - Date range picker
  - Department filter
  - Status filter (Present, Late, Absent, etc.)
- Export to CSV

#### Work Logs Dashboard
- Recent work logs from all employees
- Filter by employee, department, status, date
- Statistics by employee (who completed most tasks)
- Statistics by department

#### Charts & Analytics
- Line chart: Attendance trend over time
- Bar chart: Work hours by department
- Pie chart: Task status distribution
- Heatmap: Employee productivity

## UI/UX Design Principles

### Employee Experience
- **One-click check-in**: Nút lớn, dễ thấy, dễ click
- **Visual feedback**: Show current status clearly
- **Progress tracking**: Live hours counter when checked in
- **Simple work logging**: Quick add form, minimal fields

### Admin Experience
- **Dashboard overview**: Key metrics at a glance
- **Real-time updates**: See who's working right now
- **Drill-down capability**: Click to see details
- **Export functionality**: Download reports for analysis
- **Filters & search**: Easy to find specific data

### Color Scheme
- Employee Dashboard: Emerald/Teal (positive, productive)
- Admin Dashboard: Indigo/Blue (professional, analytical)
- Status colors:
  - PRESENT: Green
  - LATE: Yellow/Orange
  - ABSENT: Red
  - WORK_FROM_HOME: Purple
  - Task COMPLETED: Green
  - Task IN_PROGRESS: Blue
  - Task TODO: Gray
  - Task BLOCKED: Red

## Migration Guide

### Setup Database

Run this SQL in Supabase SQL Editor:

```sql
-- See: backend/prisma/migrations/add_attendance_worklogs.sql
```

### Deploy Backend

Backend routes are already configured in `server.ts`:
- `/api/attendance/*`
- `/api/work-logs/*`

Just push and Vercel will auto-deploy.

### Environment Variables

No new env vars needed! Uses existing JWT auth.

## Benefits

### For Employees
- ✅ Easy time tracking - just check-in/out daily
- ✅ Record what you worked on
- ✅ See your own statistics and progress
- ✅ Transparent work logging

### For Managers/Admin
- 📊 Real-time visibility into team activity
- 📈 Track attendance patterns
- 🎯 Measure productivity by hours and tasks
- 📉 Identify issues early (frequent late arrivals, low task completion)
- 📁 Generate reports for HR/accounting

### For Company
- 💼 Remote work accountability
- 📊 Data-driven decisions
- ⏱️ Accurate time tracking for billing/payroll
- 🎯 Performance metrics
- 📈 Productivity insights by department

## Future Enhancements

- [ ] Notifications: Remind to check-in/out
- [ ] Mobile app for easy check-in on phone
- [ ] Geo-location verification (optional)
- [ ] Integration with calendar for meetings
- [ ] Auto check-out at end of day
- [ ] Leave/vacation management
- [ ] Overtime tracking
- [ ] Performance reviews based on data
