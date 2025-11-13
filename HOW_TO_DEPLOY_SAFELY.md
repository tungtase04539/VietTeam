# Cách Deploy An toàn - Quick Guide

## 🚀 Quy trình nhanh

### Bước 1: Trước khi code
```bash
# Tạo branch mới cho feature
git checkout -b feature/ten-feature-moi
```

### Bước 2: Sau khi code xong
```bash
# Chạy script kiểm tra (QUAN TRỌNG!)
bash scripts/pre-deploy-check.sh
```

Script này sẽ check:
- ✓ TypeScript có lỗi không
- ✓ Build frontend/backend có thành công không
- ✓ Prisma client có được generate không
- ✓ Environment variables có đầy đủ không

### Bước 3: Nếu check passed
```bash
# Commit code
git add .
git commit -m "feat: Mô tả thay đổi"

# Push lên git
git push -u origin feature/ten-feature-moi
```

### Bước 4: Sau khi Vercel deploy xong
```bash
# Đợi 1-2 phút để Vercel deploy
# Rồi chạy test
bash scripts/test-production.sh
```

Script này sẽ test:
- ✓ Backend health check
- ✓ API endpoints responding
- ✓ Frontend accessible
- ✓ CORS configured correctly

### Bước 5: Verify trên browser
1. Mở https://viet-team-frontend.vercel.app
2. Mở DevTools (F12) → Console tab
3. Test login/register
4. Check không có error trong console

---

## ⚠️ Nếu có lỗi

### Option 1: Rollback (nhanh nhất)
```bash
# Xem commit history
git log --oneline -10

# Rollback về commit tốt
git reset --hard <commit-hash>
git push -f origin <branch-name>
```

### Option 2: Fix ngay
```bash
# Sửa lỗi
# ...

# Commit fix
git add .
git commit -m "fix: Sửa lỗi xyz"
git push
```

---

## 📋 Checklist nhanh

Trước khi deploy, tick các items sau:

```
□ Code đã test ở local
□ Chạy bash scripts/pre-deploy-check.sh → PASSED
□ Commit message rõ ràng
□ Push code
□ Đợi Vercel deployment → Status = Ready
□ Chạy bash scripts/test-production.sh → PASSED
□ Test trên browser → Login/register OK
□ Check browser console → Không có error
```

---

## 💡 Tips

### 1. Push từng phần nhỏ
```bash
# Thay vì push toàn bộ cùng lúc
git add frontend/src/components/NewComponent.tsx
git commit -m "feat: Add new component"
git push

# Test OK rồi mới push tiếp
git add frontend/src/pages/NewPage.tsx
git commit -m "feat: Add new page"
git push
```

### 2. Dùng branches cho features lớn
```bash
# Tạo branch
git checkout -b feature/big-feature

# Develop nhiều commits
git commit -m "feat: Part 1"
git commit -m "feat: Part 2"
git commit -m "feat: Part 3"

# Test kỹ
# Merge vào main khi OK
git checkout main
git merge feature/big-feature
git push
```

### 3. Monitor Vercel logs
- Vào https://vercel.com/dashboard
- Click vào project → Deployments
- Click vào deployment mới nhất
- Xem Runtime Logs
- Nếu có lỗi → sửa ngay

### 4. Environment Variables
Check đầy đủ trên Vercel:

**Backend:**
- DATABASE_URL
- DIRECT_URL
- JWT_SECRET
- FRONTEND_URL

**Frontend:**
- VITE_API_URL

---

## 📚 Chi tiết

Đọc thêm trong các files:
- **SAFE_DEPLOYMENT_GUIDE.md** - Hướng dẫn chi tiết
- **CHECK_DEPLOYMENT.md** - Troubleshooting
- **REDEPLOY_GUIDE.md** - Cách redeploy

---

## ❓ FAQ

**Q: Tại sao backend trả về "Access denied"?**
A: Đợi 1-2 phút để Vercel deploy xong. Nếu vẫn lỗi, check Vercel logs.

**Q: Frontend không connect được backend?**
A: Check VITE_API_URL trong Vercel environment variables.

**Q: Build bị lỗi TypeScript?**
A: Chạy `npx tsc --noEmit` để xem lỗi chi tiết và sửa.

**Q: Cần rollback như thế nào?**
A: `git reset --hard <commit-hash>` rồi `git push -f`

**Q: Scripts bị permission denied?**
A: Chạy `chmod +x scripts/*.sh` để set executable permission.
