import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Check in - nhân viên bắt đầu làm việc
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kiểm tra xem có session nào đang active (chưa checkout) không
    const activeSession = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        checkOutTime: null, // Chưa check-out
      },
    });

    if (activeSession) {
      return res.status(400).json({
        message: 'Bạn đang có một session làm việc đang hoạt động. Vui lòng kết thúc trước khi bắt đầu session mới.'
      });
    }

    const now = new Date();

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkInTime: now,
        status: 'PRESENT', // Luôn đánh dấu có mặt, chỉ tính theo giờ làm việc
        notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Check-in thành công',
      attendance,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Check out - nhân viên kết thúc làm việc
export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Bạn chưa check-in hôm nay' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Bạn đã check-out rồi' });
    }

    const now = new Date();

    // Lấy work logs của nhân viên trong ngày hôm nay
    const todayWorkLogs = await prisma.workLog.findMany({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Tìm work log mới nhất (dựa trên updatedAt)
    const latestWorkLog = todayWorkLogs.length > 0 ? todayWorkLogs[0] : null;

    let totalHours = attendance.checkInTime
      ? (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : 0;

    let actualHours = totalHours;
    let warning = null;
    let lastActivityTime = now;

    // Nếu có work log, kiểm tra khoảng cách thời gian
    if (latestWorkLog && attendance.checkInTime) {
      const timeSinceLastUpdate = (now.getTime() - latestWorkLog.updatedAt.getTime()) / (1000 * 60); // phút

      if (timeSinceLastUpdate > 10) {
        // Tính thời gian thực tế dựa trên work log mới nhất
        actualHours = (latestWorkLog.updatedAt.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
        lastActivityTime = latestWorkLog.updatedAt;

        warning = {
          message: 'Bạn chưa cập nhật công việc trong 10 phút gần đây. Thời gian làm việc được tính đến lần cập nhật công việc mới nhất.',
          lastWorkLogUpdate: latestWorkLog.updatedAt,
          timeSinceLastUpdate: Math.round(timeSinceLastUpdate),
          checkOutTime: now,
          actualWorkHours: Math.round(actualHours * 100) / 100,
          declaredHours: Math.round(totalHours * 100) / 100,
        };

        // Sử dụng actualHours thay vì totalHours
        totalHours = actualHours;
      }
    } else if (!latestWorkLog) {
      // Không có work log nào trong ngày
      warning = {
        message: 'Bạn chưa cập nhật công việc nào trong ngày hôm nay. Vui lòng cập nhật work log để ghi nhận thời gian làm việc chính xác.',
        checkOutTime: now,
        actualWorkHours: 0,
        declaredHours: Math.round(totalHours * 100) / 100,
      };

      // Không có work log = 0 giờ làm việc thực tế
      totalHours = 0;
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        totalHours: Math.round(totalHours * 100) / 100,
        notes: notes || attendance.notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const response: any = {
      message: 'Check-out thành công',
      attendance: updatedAttendance,
    };

    if (warning) {
      response.warning = warning;
    }

    res.json(response);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get today's attendance for current employee
export const getTodayAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tìm session đang active (chưa checkout)
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        checkOutTime: null,
      },
    });

    // Nếu không có active session, lấy session mới nhất trong ngày
    const attendance = activeAttendance || await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    // Lấy tất cả sessions trong ngày để tính tổng giờ
    const allTodaySessions = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalHoursToday = allTodaySessions.reduce((sum, session) => {
      return sum + (session.totalHours || 0);
    }, 0);

    res.json({
      attendance,
      allSessions: allTodaySessions,
      totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      sessionsCount: allTodaySessions.length,
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get my attendance records
export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { startDate, endDate, limit = 30 } = req.query;

    const where: any = { employeeId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Group by date and sum hours (vì có thể có nhiều sessions trong 1 ngày)
    const dailyMap = new Map<string, { date: string; sessions: any[]; totalHours: number }>();

    attendances.forEach((att) => {
      const dateKey = att.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, sessions: [], totalHours: 0 });
      }
      const entry = dailyMap.get(dateKey)!;
      entry.sessions.push(att);
      entry.totalHours += att.totalHours || 0;
    });

    const dailyRecords = Array.from(dailyMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, parseInt(limit as string));

    // Calculate statistics
    const totalDays = dailyRecords.length;
    const totalHours = dailyRecords.reduce((sum, day) => sum + day.totalHours, 0);
    const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;

    res.json({
      attendances: dailyRecords,
      allSessions: attendances, // Tất cả sessions
      statistics: {
        totalDays,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        attendanceRate: 100, // Luôn 100% vì chỉ tính giờ, không tính đi muộn
      },
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get all attendance records (Admin only)
export const getAllAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, employeeId, status } = req.query;

    const where: any = {};

    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ attendances });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get attendance summary (Admin only)
export const getAttendanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
    });

    // This month statistics
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
        },
      },
    });

    const totalEmployees = await prisma.employee.count();
    const checkedInToday = todayAttendances.filter((att) => att.checkInTime).length;
    const checkedOutToday = todayAttendances.filter((att) => att.checkOutTime).length;

    const totalHoursThisMonth = monthAttendances.reduce(
      (sum, att) => sum + (att.totalHours || 0),
      0
    );

    // Group by department
    const departmentStats: Record<string, any> = {};
    todayAttendances.forEach((att) => {
      const dept = att.employee.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, present: 0 };
      }
      departmentStats[dept].total++;
      if (att.checkInTime) departmentStats[dept].present++;
    });

    res.json({
      today: {
        date: today,
        totalEmployees,
        checkedIn: checkedInToday,
        checkedOut: checkedOutToday,
        late: 0, // Không tính đi muộn nữa
        attendanceRate: totalEmployees > 0 ? Math.round((checkedInToday / totalEmployees) * 100) : 0,
      },
      realTimeAttendance: todayAttendances,
      thisMonth: {
        totalHours: Math.round(totalHoursThisMonth * 100) / 100,
        averageHoursPerDay:
          monthAttendances.length > 0
            ? Math.round((totalHoursThisMonth / monthAttendances.length) * 100) / 100
            : 0,
      },
      departmentStats,
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
