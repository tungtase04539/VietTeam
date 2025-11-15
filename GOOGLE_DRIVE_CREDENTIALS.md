# 🔐 Google Drive Credentials

## ⚠️ QUAN TRỌNG: Cấu hình Environment Variables

### Frontend (.env or .env.local)

Tạo file `frontend/.env.local` với nội dung:

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Google Drive Upload
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID_HERE

# Video Upload Settings
VITE_MAX_VIDEO_SIZE=524288000
VITE_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm,video/x-matroska
```

### Backend (.env)

Thêm vào file `backend/.env`:

```env
# Existing variables...

# Google OAuth (for backend validation if needed)
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

---

## 📦 Vercel Deployment

### Frontend Environment Variables (Vercel):
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID_HERE
VITE_MAX_VIDEO_SIZE=524288000
VITE_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm,video/x-matroska
```

### Backend Environment Variables (Vercel):
```
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

---

## 🔒 Security Notes

- ✅ Client ID: OK để public (trong frontend code)
- ⚠️ Client Secret: KHÔNG để trong frontend, chỉ backend
- ✅ Folder ID: OK để public (đã share folder)
- 🔐 Access tokens: Được Google SDK quản lý tự động

---

## ⚠️ QUAN TRỌNG: Cấu hình Local

**Bạn đã có credentials, hãy tạo file local:**

### Tạo `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=[Sử dụng Client ID đã lấy từ bước 4]
VITE_GOOGLE_DRIVE_FOLDER_ID=[Sử dụng Folder ID đã lấy từ bước 5]
VITE_MAX_VIDEO_SIZE=524288000
VITE_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm,video/x-matroska
```

### Thêm vào `backend/.env`:
```env
GOOGLE_CLIENT_SECRET=[Sử dụng Client Secret đã lấy từ bước 4]
```

### Vercel Dashboard:
Thêm các biến môi trường tương tự với production URLs.

## ✅ Đã setup xong!

Code đã được implement. Chỉ cần cấu hình environment variables local để sử dụng.

