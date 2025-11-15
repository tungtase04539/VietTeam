import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get all rankings (Admin only) - Multi-category leaderboards
export const getAllRankings = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Default to current month if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate as string) : today;
    end.setHours(23, 59, 59, 999);

    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    // Get attendance data
    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get work log data
    const workLogs = await prisma.workLog.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Calculate stats for each employee
    const employeeStats = employees.map((emp) => {
      const empAttendances = attendances.filter((att) => att.employeeId === emp.id);
      const empWorkLogs = workLogs.filter((log) => log.employeeId === emp.id);

      const totalHours = empAttendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
      const attendanceDays = new Set(empAttendances.map((att) => att.date.toISOString().split('T')[0])).size;

      const totalWorkLogs = empWorkLogs.length;
      const completedWorkLogs = empWorkLogs.filter((log) => log.status === 'COMPLETED').length;
      const completionRate = totalWorkLogs > 0 ? (completedWorkLogs / totalWorkLogs) * 100 : 0;

      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        position: emp.position,
        department: emp.department,
        role: emp.user?.role,
        stats: {
          totalHours: Math.round(totalHours * 100) / 100,
          attendanceDays,
          attendanceRate: attendanceDays > 0 ? 100 : 0, // Simple: came or not
          totalWorkLogs,
          completedWorkLogs,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      };
    });

    // Category 1: Most Working Hours
    const topByHours = [...employeeStats]
      .filter((emp) => emp.stats.totalHours > 0)
      .sort((a, b) => b.stats.totalHours - a.stats.totalHours)
      .slice(0, parseInt(limit as string));

    // Category 2: Most Completed Tasks
    const topByCompletedTasks = [...employeeStats]
      .filter((emp) => emp.stats.completedWorkLogs > 0)
      .sort((a, b) => b.stats.completedWorkLogs - a.stats.completedWorkLogs)
      .slice(0, parseInt(limit as string));

    // Category 3: Highest Completion Rate (min 5 tasks)
    const topByCompletionRate = [...employeeStats]
      .filter((emp) => emp.stats.totalWorkLogs >= 5)
      .sort((a, b) => {
        if (b.stats.completionRate === a.stats.completionRate) {
          return b.stats.completedWorkLogs - a.stats.completedWorkLogs;
        }
        return b.stats.completionRate - a.stats.completionRate;
      })
      .slice(0, parseInt(limit as string));

    // Category 4: Best Attendance (most days)
    const topByAttendance = [...employeeStats]
      .filter((emp) => emp.stats.attendanceDays > 0)
      .sort((a, b) => {
        if (b.stats.attendanceDays === a.stats.attendanceDays) {
          return b.stats.totalHours - a.stats.totalHours;
        }
        return b.stats.attendanceDays - a.stats.attendanceDays;
      })
      .slice(0, parseInt(limit as string));

    res.json({
      period: {
        startDate: start,
        endDate: end,
      },
      categories: {
        topByHours,
        topByCompletedTasks,
        topByCompletionRate,
        topByAttendance,
      },
      totalEmployees: employees.length,
    });
  } catch (error) {
    console.error('Get all rankings error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get team rankings (Manager only) - Simple output-based
export const getTeamRankings = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.employee?.id;
    if (!managerId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    // Verify manager has a team
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      include: { managedTeam: { include: { members: true } } },
    });

    if (!manager?.managedTeam) {
      return res.status(403).json({ message: 'Bạn không quản lý nhóm nào' });
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

    const teamMemberIds = manager.managedTeam.members.map((m) => m.id);

    // Get attendance data
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: teamMemberIds },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get work log data
    const workLogs = await prisma.workLog.findMany({
      where: {
        employeeId: { in: teamMemberIds },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Calculate stats for each team member
    const memberStats = manager.managedTeam.members.map((member) => {
      const memberAttendances = attendances.filter((att) => att.employeeId === member.id);
      const memberWorkLogs = workLogs.filter((log) => log.employeeId === member.id);

      const totalHours = memberAttendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
      const attendanceDays = new Set(
        memberAttendances.map((att) => att.date.toISOString().split('T')[0])
      ).size;

      const totalWorkLogs = memberWorkLogs.length;
      const completedWorkLogs = memberWorkLogs.filter((log) => log.status === 'COMPLETED').length;
      const inProgressWorkLogs = memberWorkLogs.filter((log) => log.status === 'IN_PROGRESS').length;
      const todoWorkLogs = memberWorkLogs.filter((log) => log.status === 'TODO').length;
      const completionRate = totalWorkLogs > 0 ? (completedWorkLogs / totalWorkLogs) * 100 : 0;

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        position: member.position,
        stats: {
          totalHours: Math.round(totalHours * 100) / 100,
          attendanceDays,
          completedWorkLogs,
          inProgressWorkLogs,
          todoWorkLogs,
          totalWorkLogs,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      };
    });

    // Sort by completed tasks (primary), then by total hours (secondary)
    const rankings = [...memberStats].sort((a, b) => {
      if (b.stats.completedWorkLogs === a.stats.completedWorkLogs) {
        return b.stats.totalHours - a.stats.totalHours;
      }
      return b.stats.completedWorkLogs - a.stats.completedWorkLogs;
    });

    res.json({
      teamName: manager.managedTeam.name,
      period: {
        startDate: start,
        endDate: end,
      },
      rankings,
      totalMembers: teamMemberIds.length,
    });
  } catch (error) {
    console.error('Get team rankings error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

