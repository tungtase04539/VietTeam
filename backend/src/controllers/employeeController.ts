import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address, position, department, salary, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || 'EMPLOYEE',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          address,
          position,
          department,
          salary: salary ? parseFloat(salary) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return employee;
    });

    res.status(201).json({
      message: 'Tạo nhân viên thành công',
      employee: result,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(employees);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee by id error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, position, department, salary } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        position,
        department,
        salary: salary ? parseFloat(salary) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      message: 'Cập nhật nhân viên thành công',
      employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Tìm employee để lấy userId
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Xóa user (sẽ cascade xóa employee)
    await prisma.user.delete({
      where: { id: employee.userId },
    });

    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Update employee role (Admin only)
export const updateEmployeeRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: employee.userId },
      data: { role },
      include: {
        employee: {
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
      message: `Đã cập nhật vai trò thành ${role === 'ADMIN' ? 'Quản trị viên' : role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update employee role error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
