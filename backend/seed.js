const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      employee: {
        create: {
          firstName: 'Admin',
          lastName: 'System',
          position: 'System Administrator',
          department: 'IT',
          salary: 50000.00,
        },
      },
    },
  });

  console.log('✅ Admin account created:', admin.email);

  // Create Employee user
  const employee = await prisma.user.upsert({
    where: { email: 'nhanvien1@example.com' },
    update: {},
    create: {
      email: 'nhanvien1@example.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      employee: {
        create: {
          firstName: 'Nhân Viên',
          lastName: 'Một',
          position: 'Developer',
          department: 'IT',
          salary: 30000.00,
        },
      },
    },
  });

  console.log('✅ Employee account created:', employee.email);

  console.log('\n🎉 Seed completed!\n');
  console.log('📋 Demo accounts:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Employee: nhanvien1@example.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
