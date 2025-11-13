# Kiểm tra vấn đề "Access denied"

## Vấn đề
Backend đang trả về "Access denied" - đây là message từ Vercel infrastructure, không phải từ application code.

## Các bước kiểm tra

### 1. Kiểm tra Vercel Dashboard

Truy cập: https://vercel.com/dashboard

**Kiểm tra Backend Project (viet-team):**
- Vào tab **Deployments**
- Xem deployment mới nhất có status gì? (Ready/Error/Building)
- Nếu có lỗi, click vào để xem logs chi tiết
- Xem trong logs có lỗi gì không

**Kiểm tra Frontend Project (viet-team-frontend):**
- Xem deployment status
- Kiểm tra Environment Variables

### 2. Kiểm tra Vercel Logs

```bash
# Nếu có Vercel CLI
vercel logs viet-team
```

Hoặc xem trực tiếp trong Vercel Dashboard:
- Project → Deployments → Click vào deployment → Runtime Logs

### 3. Các nguyên nhân có thể

**A. Project bị restricted:**
- Vào Project Settings → General
- Kiểm tra "Protection" settings
- Đảm bảo không có Password Protection hoặc Trusted IPs

**B. Deployment failed:**
- Check build logs xem có lỗi gì
- Phổ biến: Missing environment variables, build errors

**C. Vercel project config sai:**
- Kiểm tra Framework Preset: chọn **Other** (vì dùng Express)
- Root Directory: `backend` (nếu deploy từ root)
- Build Command: `npm run build` hoặc để trống
- Output Directory: để trống (serverless function)

### 4. Solutions

**Solution 1: Tạo lại Vercel project**

Nếu project bị lỗi config, tạo mới:

1. Delete project cũ trên Vercel (hoặc rename)
2. Import lại từ GitHub
3. Config:
   - Framework: **Other**
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Output Directory: (để trống)

4. Thêm Environment Variables:
   ```
   DATABASE_URL=<Supabase connection pooling URL>
   DIRECT_URL=<Supabase direct URL>
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://viet-team-frontend.vercel.app
   NODE_ENV=production
   ```

**Solution 2: Deploy từ local**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel --prod
```

**Solution 3: Kiểm tra lại code**

Có thể code bị lỗi. Test local:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Mở terminal khác:
```bash
curl http://localhost:5000/api/health
```

### 5. Temporary workaround

Nếu cần test ngay, có thể:
- Deploy backend lên Railway/Render thay vì Vercel
- Hoặc sử dụng local backend + ngrok để expose public URL
