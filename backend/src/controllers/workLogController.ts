import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Create work log
export const createWorkLog = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { title, description, hoursSpent, status, date, videoUrl, videoFileId, videoFileName } = req.body;

    console.log('Create work log request body:', {
      title,
      description,
      hoursSpent,
      status,
      date,
      videoUrl: videoUrl ? 'HAS_VIDEO' : 'NO_VIDEO',
      videoFileId,
      videoFileName,
    });

    // Normalize date to start of day to avoid timezone issues
    const workLogDate = date ? new Date(date) : new Date();
    workLogDate.setHours(0, 0, 0, 0);

    // When employee creates their own work log, default status is IN_PROGRESS
    // When assigned by manager, status will be set by assignWorkLog endpoint
    const workLog = await prisma.workLog.create({
      data: {
        employeeId,
        title,
        description,
        hoursSpent: hoursSpent ? parseFloat(hoursSpent) : null,
        status: status || 'IN_PROGRESS', // Employee's own work starts as IN_PROGRESS
        date: workLogDate,
        videoUrl,
        videoFileId,
        videoFileName,
      },
    });

    res.status(201).json({
      message: 'Tạo work log thành công',
      workLog,
    });
  } catch (error) {
    console.error('Create work log error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get my work logs
export const getMyWorkLogs = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { startDate, endDate, status, limit = 50 } = req.query;

    const where: any = { employeeId };

    if (status) where.status = status as string;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // End of day
        where.date.lte = end;
      }
    }

    const workLogs = await prisma.workLog.findMany({
      where,
      include: {
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
    });

    // Calculate statistics
    const totalLogs = workLogs.length;
    const totalHours = workLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const completedTasks = workLogs.filter((log) => log.status === 'COMPLETED').length;
    const inProgressTasks = workLogs.filter((log) => log.status === 'IN_PROGRESS').length;
    const todoTasks = workLogs.filter((log) => log.status === 'TODO').length;
    const blockedTasks = workLogs.filter((log) => log.status === 'BLOCKED').length;

    res.json({
      workLogs,
      statistics: {
        totalLogs,
        totalHours: Math.round(totalHours * 100) / 100,
        completedTasks,
        inProgressTasks,
        todoTasks,
        blockedTasks,
        completionRate: totalLogs > 0 ? Math.round((completedTasks / totalLogs) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get my work logs error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get all work logs (Admin only)
export const getAllWorkLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, employeeId, status, limit = 100 } = req.query;

    const where: any = {};

    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // End of day
        where.date.lte = end;
      }
    }

    const workLogs = await prisma.workLog.findMany({
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
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
    });

    res.json({ workLogs });
  } catch (error) {
    console.error('Get all work logs error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Update work log
export const updateWorkLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.employee?.id;
    const { title, description, hoursSpent, status, videoUrl, videoFileId, videoFileName } = req.body;

    console.log('Update work log request:', {
      id,
      title,
      status,
      videoUrl: videoUrl ? 'HAS_VIDEO' : 'NO_VIDEO',
      videoFileId,
      videoFileName,
    });

    // Check if work log exists and belongs to current user (or user is admin)
    const existingLog = await prisma.workLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return res.status(404).json({ message: 'Không tìm thấy work log' });
    }

    if (req.user?.role !== 'ADMIN' && existingLog.employeeId !== employeeId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật work log này' });
    }

    const workLog = await prisma.workLog.update({
      where: { id },
      data: {
        title,
        description,
        hoursSpent: hoursSpent ? parseFloat(hoursSpent) : existingLog.hoursSpent,
        status: status || existingLog.status,
        videoUrl: videoUrl || existingLog.videoUrl,
        videoFileId: videoFileId || existingLog.videoFileId,
        videoFileName: videoFileName || existingLog.videoFileName,
      },
    });

    res.json({
      message: 'Cập nhật work log thành công',
      workLog,
    });
  } catch (error) {
    console.error('Update work log error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Delete work log
export const deleteWorkLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.employee?.id;

    // Check if work log exists and belongs to current user (or user is admin)
    const existingLog = await prisma.workLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return res.status(404).json({ message: 'Không tìm thấy work log' });
    }

    // Admin can delete any work log
    if (req.user?.role === 'ADMIN') {
      await prisma.workLog.delete({ where: { id } });
      return res.json({ message: 'Xóa work log thành công' });
    }

    // Check if work log belongs to current user
    if (existingLog.employeeId !== employeeId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa work log này' });
    }

    // Employee cannot delete work logs assigned by manager
    if (existingLog.assignedById) {
      return res.status(403).json({ 
        message: 'Không thể xóa công việc được giao bởi quản lý. Vui lòng liên hệ quản lý để thay đổi.' 
      });
    }

    // Can only delete self-created work logs
    await prisma.workLog.delete({
      where: { id },
    });

    res.json({ message: 'Xóa work log thành công' });
  } catch (error) {
    console.error('Delete work log error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get work log statistics (Admin only)
export const getWorkLogStats = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

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
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    // Overall statistics
    const totalLogs = workLogs.length;
    const totalHours = workLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
    const completedTasks = workLogs.filter((log) => log.status === 'COMPLETED').length;

    // Group by employee
    const employeeStats: Record<string, any> = {};
    workLogs.forEach((log) => {
      const empName = `${log.employee.firstName} ${log.employee.lastName}`;
      if (!employeeStats[empName]) {
        employeeStats[empName] = {
          totalLogs: 0,
          totalHours: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          blocked: 0,
        };
      }
      employeeStats[empName].totalLogs++;
      employeeStats[empName].totalHours += log.hoursSpent || 0;
      if (log.status === 'COMPLETED') employeeStats[empName].completed++;
      if (log.status === 'IN_PROGRESS') employeeStats[empName].inProgress++;
      if (log.status === 'TODO') employeeStats[empName].todo++;
      if (log.status === 'BLOCKED') employeeStats[empName].blocked++;
    });

    // Group by department
    const departmentStats: Record<string, any> = {};
    workLogs.forEach((log) => {
      const dept = log.employee.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { totalLogs: 0, totalHours: 0, completed: 0 };
      }
      departmentStats[dept].totalLogs++;
      departmentStats[dept].totalHours += log.hoursSpent || 0;
      if (log.status === 'COMPLETED') departmentStats[dept].completed++;
    });

    res.json({
      overall: {
        totalLogs,
        totalHours: Math.round(totalHours * 100) / 100,
        completedTasks,
        completionRate: totalLogs > 0 ? Math.round((completedTasks / totalLogs) * 100) : 0,
      },
      employeeStats,
      departmentStats,
    });
  } catch (error) {
    console.error('Get work log stats error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
