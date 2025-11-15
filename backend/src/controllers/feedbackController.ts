import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Manager gives feedback on video (Manager only)
export const giveVideoFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.employee?.id;
    if (!managerId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { workLogId } = req.params;
    const { videoQuality, feedbackNote } = req.body;

    // Verify manager has a team
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      include: { managedTeam: { include: { members: true } } },
    });

    if (!manager?.managedTeam) {
      return res.status(403).json({ message: 'Bạn không quản lý nhóm nào' });
    }

    // Get work log and verify employee is in team
    const workLog = await prisma.workLog.findUnique({
      where: { id: workLogId },
    });

    if (!workLog) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }

    const teamMemberIds = manager.managedTeam.members.map((m) => m.id);
    if (!teamMemberIds.includes(workLog.employeeId)) {
      return res.status(403).json({ message: 'Nhân viên này không thuộc nhóm của bạn' });
    }

    if (!workLog.videoUrl) {
      return res.status(400).json({ message: 'Công việc này chưa có video' });
    }

    // Update work log with feedback
    const updatedWorkLog = await prisma.workLog.update({
      where: { id: workLogId },
      data: {
        videoQuality,
        feedbackNote,
        feedbackBy: managerId,
        feedbackAt: new Date(),
        feedbackSeen: false, // Reset to unseen when new feedback given
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
      message: 'Đã gửi feedback thành công',
      workLog: updatedWorkLog,
    });
  } catch (error) {
    console.error('Give video feedback error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get unseen feedbacks for employee
export const getUnseenFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const unseenFeedbacks = await prisma.workLog.findMany({
      where: {
        employeeId,
        feedbackSeen: false,
        videoQuality: { not: null }, // Has feedback
      },
      include: {
        assignedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        feedbackAt: 'desc',
      },
    });

    res.json({
      feedbacks: unseenFeedbacks,
      count: unseenFeedbacks.length,
    });
  } catch (error) {
    console.error('Get unseen feedbacks error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Mark feedbacks as seen
export const markFeedbacksAsSeen = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.employee?.id;
    if (!employeeId) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    const { workLogIds } = req.body;

    await prisma.workLog.updateMany({
      where: {
        id: { in: workLogIds },
        employeeId,
      },
      data: {
        feedbackSeen: true,
      },
    });

    res.json({
      message: 'Đã đánh dấu đã xem',
      count: workLogIds.length,
    });
  } catch (error) {
    console.error('Mark feedbacks as seen error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

