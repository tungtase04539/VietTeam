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

    const { employeeId, title, description, date } = req.body;

    // Verify manager has a team
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      include: { managedTeam: { include: { members: true } } },
    });

    if (!manager?.managedTeam) {
      return res.status(403).json({ message: 'Bạn không quản lý nhóm nào' });
    }

    // Verify employee is in manager's team
    const isTeamMember = manager.managedTeam.members.some(
      (member) => member.id === employeeId
    );

    if (!isTeamMember) {
      return res.status(403).json({
        message: 'Nhân viên này không thuộc nhóm của bạn',
      });
    }

    // Normalize date to start of day
    const workLogDate = date ? new Date(date) : new Date();
    workLogDate.setHours(0, 0, 0, 0);

    const workLog = await prisma.workLog.create({
      data: {
        employeeId,
        assignedById: managerId,
        title,
        description,
        date: workLogDate,
        status: 'TODO', // Assigned tasks default to TODO
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        assignedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Giao việc thành công',
      workLog,
    });
  } catch (error) {
    console.error('Assign work log error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
