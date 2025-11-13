# Quy trình Deploy An toàn

## Nguyên nhân lỗi vừa rồi

Khi rollback về commit `cb2e08d`, 2 commits sau đã bị xóa:

1. **5ef1abc** - Redesign login page (thay đổi frontend):
   - Thêm `react-icons` vào package.json
   - Redesign LoginPage.tsx với modern UI

2. **745ac8d** - Error handling improvements (thay đổi frontend):
   - Thêm logging vào `api.ts`
   - Thêm request/response interceptors
   - Thêm 10 second timeout
   - Thêm nhiều console.log

**Vấn đề phát hiện:**
- Những thay đổi này CHỈ ảnh hưởng FRONTEND
- BACKEND không có thay đổi gì
- Nhưng backend vẫn trả về "Access denied"

**Nguyên nhân thật sự:**
- Vercel có thể bị cache hoặc deployment delay
- Khi push nhiều commits liên tiếp, Vercel deploy theo queue
- Đôi khi Vercel project bị stuck và cần redeploy thủ công

## Quy trình Deploy An toàn để tránh lỗi

### 1. Trước khi Push Code

✅ **Checklist:**
- [ ] Test kỹ ở local trước
- [ ] Build thành công: `npm run build`
- [ ] Backend chạy OK: test các API endpoints
- [ ] Frontend chạy OK: test login/register/dashboard
- [ ] Không có TypeScript errors
- [ ] Không có linting errors

✅ **Test Local:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Test
curl http://localhost:5000/api/health
# Mở browser: http://localhost:5173
```

### 2. Khi Push Code

✅ **Push từng phần nhỏ:**
```bash
# Thay vì push nhiều thay đổi cùng lúc
git add frontend/src/pages/LoginPage.tsx
git commit -m "feat: Update login UI"
git push

# Đợi Vercel deploy xong, test OK
# Rồi mới push tiếp
git add frontend/src/services/api.ts
git commit -m "feat: Add API logging"
git push
```

✅ **Commit messages rõ ràng:**
```bash
# Tốt
git commit -m "feat: Thêm react-icons và redesign login page"
git commit -m "fix: Sửa lỗi API timeout"

# Không tốt
git commit -m "update"
git commit -m "fix bug"
```

### 3. Sau khi Push

✅ **Kiểm tra Vercel Deployment:**

1. Vào https://vercel.com/dashboard
2. Xem **Deployments** tab
3. Đợi status = **Ready** (không phải Building)
4. Click vào deployment → xem **Runtime Logs**
5. Nếu có lỗi → sửa ngay

✅ **Test Production:**
```bash
# Test backend
curl https://viet-team.vercel.app/api/health

# Test login
curl -X POST https://viet-team.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

✅ **Test Frontend:**
- Mở https://viet-team-frontend.vercel.app
- Mở DevTools Console (F12)
- Test login/register
- Xem console có lỗi không

### 4. Nếu có vấn đề

✅ **Quick Fix:**

**Option 1: Rollback ngay**
```bash
# Xem commit history
git log --oneline -10

# Rollback về commit tốt
git reset --hard <commit-hash>
git push -f origin <branch-name>
```

**Option 2: Fix forward**
```bash
# Sửa lỗi
# Commit và push fix
git add .
git commit -m "fix: Sửa lỗi xyz"
git push
```

**Option 3: Redeploy trên Vercel**
- Vào Vercel Dashboard
- Chọn deployment cuối cùng hoạt động tốt
- Click **Redeploy**

### 5. Best Practices

✅ **Tách Frontend và Backend:**
- Thay đổi frontend → chỉ push frontend
- Thay đổi backend → chỉ push backend
- Tránh push cả 2 cùng lúc

✅ **Sử dụng Branches:**
```bash
# Tạo branch cho feature mới
git checkout -b feature/new-ui

# Develop và test
# ...

# Merge vào main khi đã test kỹ
git checkout main
git merge feature/new-ui
git push
```

✅ **Environment Variables:**
- Không hard-code URLs, API keys
- Dùng .env files
- Set đúng trên Vercel Dashboard

✅ **Monitoring:**
- Thường xuyên check Vercel logs
- Setup alerts nếu có lỗi
- Monitor performance metrics

## Checklist trước mỗi deployment

```
□ Code đã test kỹ ở local
□ Build thành công (no errors)
□ Commit message rõ ràng
□ Push code
□ Đợi Vercel deployment Ready
□ Check Vercel logs (no errors)
□ Test production URLs
□ Verify login/register works
□ Check browser console (no errors)
□ Monitor trong 5-10 phút đầu
```

## Khi nào cần rollback?

- Login/register không hoạt động
- API trả về lỗi 500
- Frontend bị crash
- Build failed trên Vercel
- Có breaking changes không mong muốn

**Lưu ý:** Rollback là solution cuối cùng. Nên ưu tiên fix forward nếu có thể.

## Tools hữu ích

```bash
# Xem deployment logs
vercel logs viet-team --follow

# Force redeploy
vercel --prod

# Check production status
curl -I https://viet-team.vercel.app/api/health
```

## Liên hệ khi gặp vấn đề

- Check Vercel Status: https://vercel-status.com
- Vercel Support: https://vercel.com/support
- Documentation: https://vercel.com/docs
