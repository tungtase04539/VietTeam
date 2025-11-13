// Script đơn giản để generate JWT secret mạnh
// Chạy: node generate-jwt-secret.js

const crypto = require('crypto');

console.log('🔐 Tạo JWT Secret...\n');

// Generate 32 bytes random string
const secret = crypto.randomBytes(32).toString('base64');

console.log('✅ JWT Secret của bạn:');
console.log('━'.repeat(60));
console.log(secret);
console.log('━'.repeat(60));
console.log('\n📝 Thêm vào .env hoặc Vercel Environment Variables:');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  LƯU Ý: Giữ secret này bí mật, không commit vào git!');
