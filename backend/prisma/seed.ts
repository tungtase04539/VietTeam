import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed database...');

  // Xóa dữ liệu cũ (optional - bỏ comment nếu muốn reset)
  // await prisma.employee.deleteMany();
  // await prisma.user.deleteMany();

  // Tạo admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      employee: {
        create: {
          firstName: 'Admin',
          lastName: 'Nguyen',
          position: 'Giám đốc',
          department: 'Quản lý',
          salary: 50000000,
          phone: '0123456789',
          address: 'Hà Nội',
        },
      },
    },
  });

  console.log('✅ Đã tạo admin:', admin.email);

  // Tạo một số nhân viên mẫu
  const employeePassword = await bcrypt.hash('employee123', 10);

  const employee1 = await prisma.user.create({
    data: {
      email: 'nhanvien1@example.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      employee: {
        create: {
          firstName: 'Văn',
          lastName: 'Nguyễn',
          position: 'Nhân viên kinh doanh',
          department: 'Kinh doanh',
          salary: 15000000,
          phone: '0987654321',
          address: 'TP. HCM',
        },
      },
    },
  });

  console.log('✅ Đã tạo nhân viên:', employee1.email);

  const employee2 = await prisma.user.create({
    data: {
      email: 'nhanvien2@example.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      employee: {
        create: {
          firstName: 'Thị',
          lastName: 'Trần',
          position: 'Kế toán',
          department: 'Tài chính',
          salary: 18000000,
          phone: '0912345678',
          address: 'Đà Nẵng',
        },
      },
    },
  });

  console.log('✅ Đã tạo nhân viên:', employee2.email);

  console.log('\n📝 Thông tin đăng nhập:');
  console.log('Admin:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
  console.log('\nNhân viên:');
  console.log('  Email: nhanvien1@example.com');
  console.log('  Password: employee123');
  console.log('  Email: nhanvien2@example.com');
  console.log('  Password: employee123');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
