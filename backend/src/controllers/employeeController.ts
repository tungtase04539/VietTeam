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

// Reset all data (Admin only) - DANGER!
export const resetAllData = async (req: AuthRequest, res: Response) => {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
      prisma.workLog.deleteMany({}),
      prisma.attendance.deleteMany({}),
      prisma.team.deleteMany({}),
      prisma.employee.deleteMany({
        where: {
          user: {
            role: { not: 'ADMIN' }, // Keep admin accounts
          },
        },
      }),
      prisma.user.deleteMany({
        where: {
          role: { not: 'ADMIN' }, // Keep admin accounts
        },
      }),
    ]);

    res.json({
      message: 'Đã reset toàn bộ dữ liệu (giữ lại tài khoản admin)',
      deleted: {
        workLogs: true,
        attendances: true,
        teams: true,
        employees: true,
        users: true,
      },
    });
  } catch (error) {
    console.error('Reset all data error:', error);
    res.status(500).json({ message: 'Lỗi server khi reset dữ liệu' });
  }
};

// Create demo accounts (Admin only)
export const createDemoAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const demoEmployees = [
      {
        email: 'demo1@vietteam.com',
        firstName: 'An',
        lastName: 'Nguyễn Văn',
        position: 'Senior Developer',
        department: 'IT',
        salary: 25000000,
      },
      {
        email: 'demo2@vietteam.com',
        firstName: 'Bình',
        lastName: 'Trần Văn',
        position: 'UI/UX Designer',
        department: 'Design',
        salary: 20000000,
      },
      {
        email: 'demo3@vietteam.com',
        firstName: 'Châu',
        lastName: 'Lê Thị',
        position: 'QA Tester',
        department: 'QA',
        salary: 18000000,
      },
      {
        email: 'demo4@vietteam.com',
        firstName: 'Dũng',
        lastName: 'Phạm Minh',
        position: 'Backend Developer',
        department: 'IT',
        salary: 22000000,
      },
      {
        email: 'demo5@vietteam.com',
        firstName: 'Em',
        lastName: 'Võ Thị',
        position: 'Frontend Developer',
        department: 'IT',
        salary: 21000000,
      },
    ];

    const createdEmployees = [];

    for (const demoData of demoEmployees) {
      // Check if email already exists
      const existing = await prisma.user.findUnique({
        where: { email: demoData.email },
      });

      if (existing) {
        continue; // Skip if already exists
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: demoData.email,
            password: hashedPassword,
            role: 'EMPLOYEE',
          },
        });

        const employee = await tx.employee.create({
          data: {
            userId: user.id,
            firstName: demoData.firstName,
            lastName: demoData.lastName,
            phone: '0' + Math.floor(Math.random() * 1000000000),
            address: 'Hà Nội, Việt Nam',
            position: demoData.position,
            department: demoData.department,
            salary: demoData.salary,
          },
        });

        return { user, employee };
      });

      createdEmployees.push(result);
    }

    res.status(201).json({
      message: `Đã tạo ${createdEmployees.length} tài khoản demo`,
      employees: createdEmployees,
      credentials: {
        password: '123456',
        accounts: demoEmployees.map((d) => d.email),
      },
    });
  } catch (error) {
    console.error('Create demo accounts error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo demo accounts' });
  }
};

// Create demo data for rankings (Admin only)
export const createDemoData = async (req: AuthRequest, res: Response) => {
  try {
    // Get all employees
    const employees = await prisma.employee.findMany({
      where: {
        user: {
          role: { not: 'ADMIN' },
        },
      },
    });

    if (employees.length === 0) {
      return res.status(400).json({ 
        message: 'Không có nhân viên nào để tạo demo data. Hãy tạo demo accounts trước!' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate data for last 30 days
    const attendanceRecords = [];
    const workLogRecords = [];

    for (const employee of employees) {
      // Random performance factor (0.6 - 1.0)
      const performanceFactor = 0.6 + Math.random() * 0.4;
      
      // Generate attendance for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 80-100% chance of attendance based on performance
        if (Math.random() < 0.8 + performanceFactor * 0.2) {
          const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Work 6-10 hours
          const hoursWorked = 6 + Math.random() * 4 * performanceFactor;
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(
            checkInTime.getHours() + Math.floor(hoursWorked),
            checkInTime.getMinutes() + Math.floor((hoursWorked % 1) * 60)
          );

          attendanceRecords.push({
            employeeId: employee.id,
            date,
            checkInTime,
            checkOutTime,
            totalHours: Math.round(hoursWorked * 100) / 100,
            status: 'PRESENT',
          });
        }
      }

      // Generate work logs for last 30 days
      const tasksPerDay = Math.floor(1 + Math.random() * 3 * performanceFactor); // 1-3 tasks/day
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        for (let j = 0; j < tasksPerDay; j++) {
          const taskTypes = [
            'Code Review',
            'Bug Fix',
            'Feature Development',
            'Documentation',
            'Meeting',
            'Testing',
            'Deployment',
            'Refactoring',
          ];

          const randomStatus = Math.random();
          let status: string;
          let hoursSpent: number | null = null;

          // Status distribution based on performance
          if (randomStatus < performanceFactor * 0.7) {
            status = 'COMPLETED';
            hoursSpent = 0.5 + Math.random() * 3; // 0.5-3.5 hours
          } else if (randomStatus < performanceFactor * 0.85) {
            status = 'IN_PROGRESS';
            hoursSpent = 0.5 + Math.random() * 2;
          } else if (randomStatus < 0.95) {
            status = 'TODO';
          } else {
            status = 'BLOCKED';
          }

          workLogRecords.push({
            employeeId: employee.id,
            title: taskTypes[Math.floor(Math.random() * taskTypes.length)],
            description: `Demo task for ${employee.firstName}`,
            date,
            status,
            hoursSpent: hoursSpent ? Math.round(hoursSpent * 100) / 100 : null,
          });
        }
      }
    }

    // Create all records
    await prisma.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true,
    });

    await prisma.workLog.createMany({
      data: workLogRecords,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: `Đã tạo demo data thành công!`,
      summary: {
        employees: employees.length,
        attendances: attendanceRecords.length,
        workLogs: workLogRecords.length,
        period: '30 ngày gần đây',
      },
    });
  } catch (error) {
    console.error('Create demo data error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo demo data' });
  }
};