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

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Bạn đã check-in hôm nay rồi' });
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
    const totalHours = attendance.checkInTime
      ? (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : 0;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
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

    res.json({
      message: 'Check-out thành công',
      attendance: updatedAttendance,
    });
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

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({ attendance });
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
      take: parseInt(limit as string),
    });

    // Calculate statistics
    const totalDays = attendances.length;
    const totalHours = attendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
    const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;

    res.json({
      attendances,
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
