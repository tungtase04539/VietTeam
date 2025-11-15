import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Calculate employee earnings (Admin only)
export const calculateEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate
      ? new Date(startDate as string)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate as string) : today;
    end.setHours(23, 59, 59, 999);

    const where: any = {};
    if (employeeId) where.id = employeeId as string;

    // Get employees
    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: { select: { role: true } },
      },
    });

    // Calculate earnings for each employee
    const earningsData = await Promise.all(
      employees.map(async (employee) => {
        // Get attendance data
        const attendances = await prisma.attendance.findMany({
          where: {
            employeeId: employee.id,
            date: { gte: start, lte: end },
          },
        });

        const totalHours = attendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
        const attendanceDays = attendances.length;

        let earnings = 0;
        let calculationMethod = '';

        if (employee.salaryType === 'HOURLY') {
          // Tính theo giờ
          earnings = totalHours * (employee.hourlyRate || 0);
          calculationMethod = `${totalHours.toFixed(2)} giờ × ${employee.hourlyRate?.toLocaleString('vi-VN')} VND/giờ`;
        } else {
          // Tính theo tháng
          earnings = employee.salary || 0;
          calculationMethod = `Lương tháng cố định`;
        }

        return {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department,
          salaryType: employee.salaryType,
          hourlyRate: employee.hourlyRate,
          monthlySalary: employee.salary,
          totalHours: Math.round(totalHours * 100) / 100,
          attendanceDays,
          earnings: Math.round(earnings),
          calculationMethod,
        };
      })
    );

    // Sort by earnings
    earningsData.sort((a, b) => b.earnings - a.earnings);

    // Calculate totals
    const totalEarnings = earningsData.reduce((sum, emp) => sum + emp.earnings, 0);
    const totalHours = earningsData.reduce((sum, emp) => sum + emp.totalHours, 0);

    res.json({
      period: { startDate: start, endDate: end },
      employees: earningsData,
      summary: {
        totalEmployees: earningsData.length,
        totalEarnings: Math.round(totalEarnings),
        totalHours: Math.round(totalHours * 100) / 100,
        averageEarningsPerEmployee: earningsData.length > 0 ? Math.round(totalEarnings / earningsData.length) : 0,
      },
    });
  } catch (error) {
    console.error('Calculate earnings error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get my earnings (Employee/Manager)
export const getMyEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { startDate, endDate } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDate
      ? new Date(startDate as string)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate as string) : today;
    end.setHours(23, 59, 59, 999);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Get attendance data
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
      },
    });

    const totalHours = attendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
    const attendanceDays = attendances.length;

    let earnings = 0;
    let calculationDetails = {};

    if (employee.salaryType === 'HOURLY') {
      earnings = totalHours * (employee.hourlyRate || 0);
      calculationDetails = {
        type: 'HOURLY',
        totalHours: Math.round(totalHours * 100) / 100,
        hourlyRate: employee.hourlyRate,
        formula: `${totalHours.toFixed(2)} giờ × ${employee.hourlyRate?.toLocaleString('vi-VN')} VND/giờ`,
      };
    } else {
      earnings = employee.salary || 0;
      calculationDetails = {
        type: 'MONTHLY',
        monthlySalary: employee.salary,
        formula: 'Lương tháng cố định',
      };
    }

    res.json({
      period: { startDate: start, endDate: end },
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        salaryType: employee.salaryType,
      },
      attendance: {
        totalHours: Math.round(totalHours * 100) / 100,
        attendanceDays,
      },
      earnings: Math.round(earnings),
      calculationDetails,
    });
  } catch (error) {
    console.error('Get my earnings error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

