# Hướng dẫn Redeploy Backend sau khi Rollback

## Vấn đề hiện tại
Backend đang trả về "Access denied" vì chưa được deploy lại sau khi rollback code.

## Cách fix (2 cách)

### Cách 1: Redeploy qua Vercel Dashboard (Dễ nhất)

1. Truy cập: https://vercel.com/dashboard
2. Chọn project **viet-team** (backend)
3. Vào tab **Deployments**
4. Click vào deployment mới nhất
5. Click nút **Redeploy** ở góc phải
6. Chọn **Use existing Build Cache: NO**
7. Click **Redeploy**

### Cách 2: Force Redeploy bằng Git Push

```bash
# Tạo empty commit để trigger redeploy
git commit --allow-empty -m "chore: force redeploy backend"
git push -u origin claude/create-new-feature-011CV5a9q8TAmFi3GaGTDU92
```

## Kiểm tra sau khi deploy

Sau khi deploy xong, test lại:

```bash
# Test health check
curl https://viet-team.vercel.app/api/health

# Should return: {"status":"OK","message":"Server is running"}
```

```bash
# Test login endpoint
curl -X POST https://viet-team.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Should return user data or error message (not "Access denied")
```

## Kiểm tra Environment Variables

Đảm bảo các biến môi trường sau đã được set trong Vercel:

**Backend (viet-team project):**
- `DATABASE_URL` - Connection pooling URL từ Supabase
- `DIRECT_URL` - Direct connection URL từ Supabase
- `JWT_SECRET` - Secret key cho JWT
- `FRONTEND_URL` - URL của frontend: `https://viet-team-frontend.vercel.app`

**Frontend (viet-team-frontend project):**
- `VITE_API_URL` - URL của backend: `https://viet-team.vercel.app/api`

## Nếu vẫn gặp lỗi

1. Check Vercel deployment logs xem có lỗi gì
2. Verify Supabase database có tables chưa
3. Test local để đảm bảo code hoạt động
