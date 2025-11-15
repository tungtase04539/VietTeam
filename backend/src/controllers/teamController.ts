import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Create team (Admin only)
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, managerId } = req.body;

    // Verify manager exists and update their role to MANAGER
    if (managerId) {
      const manager = await prisma.employee.findUnique({
        where: { id: managerId },
        include: { user: true },
      });

      if (!manager) {
        return res.status(404).json({ message: 'Không tìm thấy nhân viên được chọn làm quản lý' });
      }

      // Update user role to MANAGER
      await prisma.user.update({
        where: { id: manager.userId },
        data: { role: 'MANAGER' },
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Tạo nhóm thành công',
      team,
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get all teams (Admin only)
export const getAllTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ teams });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get my team (Manager or Employee)
export const getMyTeam = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        team: {
          include: {
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
              },
            },
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
              },
            },
          },
        },
        managedTeam: {
          include: {
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
              },
            },
          },
        },
      },
    });

    res.json({
      team: employee?.team,
      managedTeam: employee?.managedTeam,
    });
  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Add employee to team (Admin only)
export const addEmployeeToTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { employeeId } = req.body;

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { teamId },
      include: {
        team: {
          include: {
            manager: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: 'Thêm nhân viên vào nhóm thành công',
      employee,
    });
  } catch (error) {
    console.error('Add employee to team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Remove employee from team (Admin only)
export const removeEmployeeFromTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { teamId: null },
    });

    res.json({
      message: 'Xóa nhân viên khỏi nhóm thành công',
      employee,
    });
  } catch (error) {
    console.error('Remove employee from team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Update team (Admin only)
export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    // If changing manager, update roles
    if (managerId !== undefined) {
      const existingTeam = await prisma.team.findUnique({
        where: { id },
        include: { manager: { include: { user: true } } },
      });

      // Demote old manager if exists
      if (existingTeam?.manager) {
        await prisma.user.update({
          where: { id: existingTeam.manager.userId },
          data: { role: 'EMPLOYEE' },
        });
      }

      // Promote new manager if provided
      if (managerId) {
        const newManager = await prisma.employee.findUnique({
          where: { id: managerId },
          include: { user: true },
        });

        if (newManager) {
          await prisma.user.update({
            where: { id: newManager.userId },
            data: { role: 'MANAGER' },
          });
        }
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
        managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
    });

    res.json({
      message: 'Cập nhật nhóm thành công',
      team,
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Delete team (Admin only)
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: { manager: { include: { user: true } } },
    });

    // Demote manager when deleting team
    if (team?.manager) {
      await prisma.user.update({
        where: { id: team.manager.userId },
        data: { role: 'EMPLOYEE' },
      });
    }

    await prisma.team.delete({
      where: { id },
    });

    res.json({ message: 'Xóa nhóm thành công' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Assign work log to team member (Manager only)
export const assignWorkLog = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.employee?.id;
    if (!managerId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { employeeIds, title, description, startDate, endDate } = req.body;

    // Verify manager has a team
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      include: { managedTeam: { include: { members: true } } },
    });

    if (!manager?.managedTeam) {
      return res.status(403).json({ message: 'Bạn không quản lý nhóm nào' });
    }

    const teamMemberIds = manager.managedTeam.members.map((m) => m.id);

    // Validate all employees are in manager's team
    const employeeIdsArray = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    const invalidEmployees = employeeIdsArray.filter((id) => !teamMemberIds.includes(id));

    if (invalidEmployees.length > 0) {
      return res.status(403).json({
        message: 'Một số nhân viên không thuộc nhóm của bạn',
      });
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : start;
    end.setHours(0, 0, 0, 0);

    // Generate all dates in range
    const dates: Date[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create work logs for all employees and all dates
    const workLogs = [];
    for (const employeeId of employeeIdsArray) {
      for (const date of dates) {
        const workLog = await prisma.workLog.create({
          data: {
            employeeId,
            assignedById: managerId,
            title,
            description,
            date: new Date(date),
            status: 'TODO',
          },
        });
        workLogs.push(workLog);
      }
    }

    const totalCreated = workLogs.length;
    const employeeCount = employeeIdsArray.length;
    const dayCount = dates.length;

    res.status(201).json({
      message: `Đã giao ${totalCreated} công việc cho ${employeeCount} nhân viên trong ${dayCount} ngày`,
      workLogs,
      summary: {
        totalWorkLogs: totalCreated,
        employeeCount,
        dayCount,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Assign work log error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get team attendance summary (Manager only)
export const getTeamAttendanceSummary = async (req: AuthRequest, res: Response) => {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamMemberIds = manager.managedTeam.members.map((m) => m.id);

    // Today's attendance for team members
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: teamMemberIds },
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
    });

    // This month statistics
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAttendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: teamMemberIds },
        date: { gte: startOfMonth },
      },
    });

    const totalTeamMembers = teamMemberIds.length;
    
    // Tính unique employees đã check-in
    const uniqueCheckedIn = new Set(
      todayAttendances.filter((att) => att.checkInTime).map((att) => att.employeeId)
    );
    const checkedInToday = uniqueCheckedIn.size;

    // Tính unique employees đang làm việc
    const currentlyWorking = new Set(
      todayAttendances
        .filter((att) => att.checkInTime && !att.checkOutTime)
        .map((att) => att.employeeId)
    );

    const totalHoursThisMonth = monthAttendances.reduce(
      (sum, att) => sum + (att.totalHours || 0),
      0
    );

    res.json({
      today: {
        date: today,
        totalTeamMembers,
        checkedIn: checkedInToday,
        currentlyWorking: currentlyWorking.size,
        attendanceRate: totalTeamMembers > 0 
          ? Math.round((checkedInToday / totalTeamMembers) * 100) 
          : 0,
      },
      thisMonth: {
        totalHours: Math.round(totalHoursThisMonth * 100) / 100,
        averageHoursPerDay:
          monthAttendances.length > 0
            ? Math.round((totalHoursThisMonth / monthAttendances.length) * 100) / 100
            : 0,
      },
      realTimeAttendance: todayAttendances,
    });
  } catch (error) {
    console.error('Get team attendance summary error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get team work log statistics (Manager only)
export const getTeamWorkLogStats = async (req: AuthRequest, res: Response) => {
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

    const teamMemberIds = manager.managedTeam.members.map((m) => m.id);

    const where: any = {
      employeeId: { in: teamMemberIds },
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const workLogs = await prisma.workLog.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Overall statistics
    const totalLogs = workLogs.length;
    const totalHours = workLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const completedTasks = workLogs.filter((log) => log.status === 'COMPLETED').length;
    const inProgressTasks = workLogs.filter((log) => log.status === 'IN_PROGRESS').length;
    const todoTasks = workLogs.filter((log) => log.status === 'TODO').length;
    const blockedTasks = workLogs.filter((log) => log.status === 'BLOCKED').length;

    // Group by employee
    const employeeStats: Record<string, any> = {};
    workLogs.forEach((log) => {
      const empId = log.employee.id;
      const empName = `${log.employee.firstName} ${log.employee.lastName}`;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          name: empName,
          totalLogs: 0,
          totalHours: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          blocked: 0,
        };
      }
      employeeStats[empId].totalLogs++;
      employeeStats[empId].totalHours += log.hoursSpent || 0;
      if (log.status === 'COMPLETED') employeeStats[empId].completed++;
      if (log.status === 'IN_PROGRESS') employeeStats[empId].inProgress++;
      if (log.status === 'TODO') employeeStats[empId].todo++;
      if (log.status === 'BLOCKED') employeeStats[empId].blocked++;
    });

    res.json({
      overall: {
        totalLogs,
        totalHours: Math.round(totalHours * 100) / 100,
        completedTasks,
        inProgressTasks,
        todoTasks,
        blockedTasks,
        completionRate: totalLogs > 0 ? Math.round((completedTasks / totalLogs) * 100) : 0,
      },
      employeeStats: Object.values(employeeStats),
      recentWorkLogs: workLogs.slice(0, 10),
    });
  } catch (error) {
    console.error('Get team work log stats error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};