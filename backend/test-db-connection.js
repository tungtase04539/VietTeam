// Script đơn giản để test kết nối PostgreSQL
// Chạy: node test-db-connection.js

require('dotenv').config();
const { Client } = require('pg');

// Parse DATABASE_URL từ .env
const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Kiểm tra kết nối PostgreSQL...\n');
console.log('📝 DATABASE_URL từ .env:');
console.log(databaseUrl);
console.log('');

if (!databaseUrl) {
  console.error('❌ Không tìm thấy DATABASE_URL trong file .env!');
  console.log('Hãy kiểm tra file .env của bạn.');
  process.exit(1);
}

// Parse connection string để hiển thị thông tin
try {
  const url = new URL(databaseUrl);
  console.log('📊 Thông tin kết nối:');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Port: ${url.port}`);
  console.log(`   Database: ${url.pathname.slice(1).split('?')[0]}`);
  console.log(`   Username: ${url.username}`);
  console.log(`   Password: ${url.password ? '***' + url.password.slice(-2) : '(không có)'}`);
  console.log('');
} catch (error) {
  console.error('❌ DATABASE_URL không đúng format!');
  console.error('Format đúng: postgresql://username:password@host:port/database');
  process.exit(1);
}

// Thử kết nối
const client = new Client({
  connectionString: databaseUrl,
});

console.log('⏳ Đang thử kết nối...\n');

client.connect((err) => {
  if (err) {
    console.error('❌ KẾT NỐI THẤT BẠI!\n');
    console.error('Chi tiết lỗi:');
    console.error(err.message);
    console.log('\n📋 Các lỗi thường gặp và cách sửa:\n');

    if (err.message.includes('password authentication failed')) {
      console.log('🔑 Lỗi: Sai password hoặc username');
      console.log('   → Kiểm tra lại username và password trong file .env');
      console.log('   → Username mặc định của PostgreSQL là: postgres');
      console.log('   → Thử các password phổ biến: postgres, admin, root, hoặc để trống');
    } else if (err.message.includes('does not exist')) {
      console.log('🗄️  Lỗi: Database chưa được tạo');
      console.log('   → Chạy: psql -U postgres');
      console.log('   → Sau đó: CREATE DATABASE employee_management;');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('🔌 Lỗi: PostgreSQL server không chạy');
      console.log('   → Mở Services (services.msc) và start postgresql');
      console.log('   → Hoặc kiểm tra Task Manager có process postgres.exe không');
    } else if (err.message.includes('timeout')) {
      console.log('⏱️  Lỗi: Timeout khi kết nối');
      console.log('   → Kiểm tra PostgreSQL có đang chạy không');
      console.log('   → Kiểm tra port 5432 có bị block không');
    }

    console.log('\n📖 Xem thêm: backend/FIX_DATABASE_ERROR.md');
    process.exit(1);
  }

  console.log('✅ KẾT NỐI THÀNH CÔNG!\n');
  console.log('🎉 PostgreSQL đã sẵn sàng!');
  console.log('📝 Bây giờ bạn có thể chạy:');
  console.log('   1. npx prisma migrate dev --name init');
  console.log('   2. npm run prisma:seed');
  console.log('   3. npm run dev');

  client.end();
  process.exit(0);
});
