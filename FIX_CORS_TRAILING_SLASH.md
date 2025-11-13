# Fix lỗi CORS Trailing Slash

## ✅ Đã sửa

**File:** `backend/src/server.ts`

**Thay đổi:**
```typescript
// Before
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  ...
};

// After
const frontendUrl = process.env.FRONTEND_URL || '*';
const normalizedOrigin = frontendUrl === '*' ? '*' : frontendUrl.replace(/\/$/, '');

const corsOptions = {
  origin: normalizedOrigin,
  ...
};
```

## 🐛 Nguyên nhân lỗi

Lỗi CORS xuất hiện do:
```
Backend CORS header:        'https://viet-team-frontend.vercel.app/'  ← có slash
Frontend origin:            'https://viet-team-frontend.vercel.app'   ← không có slash
```

CORS yêu cầu origin phải match **CHÍNH XÁC 100%**. Sự khác biệt 1 ký tự "/" cũng làm preflight request thất bại.

## 🔍 Kiểm tra Environment Variable

**Bước 1:** Vào Vercel Dashboard
- https://vercel.com/dashboard
- Chọn project **viet-team** (backend)
- Settings → Environment Variables

**Bước 2:** Kiểm tra `FRONTEND_URL`

Có thể có 2 trường hợp:

### Case 1: URL có trailing slash
```
FRONTEND_URL = https://viet-team-frontend.vercel.app/  ← CÓ slash
```
→ **Solution:** Code đã fix, sẽ tự động remove slash

### Case 2: URL không có trailing slash
```
FRONTEND_URL = https://viet-team-frontend.vercel.app  ← KHÔNG có slash
```
→ **Perfect!** Không cần thay đổi gì

## 🚀 Sau khi push

1. **Vercel sẽ tự động deploy** (~1-2 phút)
2. Kiểm tra deployment status:
   - Dashboard → Deployments → Xem status = "Ready"

3. Test CORS:
```bash
curl -I -X OPTIONS https://viet-team.vercel.app/api/auth/login \
  -H "Origin: https://viet-team-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Should see:
```
Access-Control-Allow-Origin: https://viet-team-frontend.vercel.app
Access-Control-Allow-Credentials: true
```

4. Test trong browser:
   - Mở https://viet-team-frontend.vercel.app
   - Mở DevTools (F12) → Console
   - Thử login/register
   - Không còn lỗi CORS

## 💡 Nếu vẫn gặp lỗi

### Option 1: Set lại Environment Variable

Trong Vercel Dashboard (backend project):
```
FRONTEND_URL = https://viet-team-frontend.vercel.app
```
**Lưu ý:** Không có trailing slash "/"

### Option 2: Dùng wildcard (temporary)

Để test nhanh, có thể dùng:
```
FRONTEND_URL = *
```
Nhưng **KHÔNG NÊN** dùng trong production (security risk).

### Option 3: Allow multiple origins

Nếu cần support nhiều origins:

```typescript
const allowedOrigins = [
  'https://viet-team-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 📝 Commits

```
88eea0c - fix: Sửa lỗi CORS trailing slash causing preflight failure
```

Code đã được push, đợi Vercel deploy xong rồi test lại!
