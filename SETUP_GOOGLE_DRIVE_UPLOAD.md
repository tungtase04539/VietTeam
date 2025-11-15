# 🎥 Hướng dẫn Setup Google Drive Upload

## 📋 Tổng quan
Tính năng upload video trực tiếp từ browser lên Google Drive cho nhân viên sáng tạo nội dung.

---

## 🚀 BƯỚC 1: Tạo Google Cloud Project

### 1.1. Truy cập Google Cloud Console
```
URL: https://console.cloud.google.com
```

### 1.2. Tạo Project mới
1. Click **"Select a project"** ở top bar
2. Click **"New Project"**
3. Điền thông tin:
   - **Project name**: `VietTeam-Video-Upload` (hoặc tên bạn thích)
   - **Organization**: Để trống nếu cá nhân
4. Click **"Create"**
5. Đợi 10-30 giây

✅ **Lưu lại Project ID** (VD: `vietteam-video-upload-123456`)

---

## 🔑 BƯỚC 2: Bật Google Drive API

### 2.1. Enable APIs
1. Trong project vừa tạo
2. Vào **"APIs & Services"** → **"Library"**
3. Tìm kiếm: **"Google Drive API"**
4. Click vào **"Google Drive API"**
5. Click **"Enable"**

### 2.2. Tương tự, enable thêm:
- **Google Picker API** (cho file picker nếu cần)

---

## 🎫 BƯỚC 3: Tạo OAuth 2.0 Credentials

### 3.1. Configure OAuth Consent Screen
1. Vào **"APIs & Services"** → **"OAuth consent screen"**
2. Chọn:
   - **User Type**: `External` (nếu không có Google Workspace)
   - Hoặc `Internal` (nếu có Google Workspace)
3. Click **"Create"**

### 3.2. Điền thông tin App:
```
App name: VietTeam Video Upload
User support email: your-email@gmail.com
Developer contact: your-email@gmail.com
```
4. Click **"Save and Continue"**

### 3.3. Scopes (Quyền truy cập):
Click **"Add or Remove Scopes"**, tìm và chọn:
- ✅ `https://www.googleapis.com/auth/drive.file` (upload files)
- ✅ `https://www.googleapis.com/auth/drive.readonly` (read files)

Click **"Update"** → **"Save and Continue"**

### 3.4. Test Users (nếu External):
Add email của bạn và team để test
Click **"Save and Continue"**

---

## 🔐 BƯỚC 4: Tạo OAuth Client ID

### 4.1. Tạo Credentials
1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"**
3. Chọn **"OAuth client ID"**

### 4.2. Điền thông tin:
```
Application type: Web application
Name: VietTeam Frontend

Authorized JavaScript origins:
- http://localhost:5173 (development)
- http://localhost:3000 (alternative)
- https://your-frontend-domain.vercel.app (production)

Authorized redirect URIs:
- http://localhost:5173/
- https://your-frontend-domain.vercel.app/
```

4. Click **"Create"**

### 4.3. Lưu lại thông tin:
```
✅ Client ID: 
   123456789-abcdefghijk.apps.googleusercontent.com

✅ Client Secret: 
   GOCSPX-xxxxxxxxxxxxxxxxx
```

⚠️ **LƯU Ý:** Client Secret chỉ hiển thị 1 lần, copy ngay!

---

## 📁 BƯỚC 5: Tạo Folder Gốc trong Google Drive

### 5.1. Tạo Folder Gốc
1. Vào **Google Drive**: https://drive.google.com
2. Tạo folder mới: **"VietTeam"** (tên chính xác)
3. Click chuột phải vào folder → **"Share"**
4. Share với:
   - **Option 1 (Khuyến nghị):** Anyone with the link - Viewer
   - **Option 2:** Specific people (add email từng người)

### 5.2. Lấy Folder ID
1. Mở folder **"VietTeam"**
2. Copy URL trên address bar:
   ```
   https://drive.google.com/drive/folders/1ABC123XYZ789
                                          ^^^^^^^^^^^^^^^^
                                          Đây là ROOT Folder ID
   ```

✅ **Lưu lại Root Folder ID**: `1ABC123XYZ789`

### 5.3. Cấu trúc Folder sẽ tự động tạo:
```
VietTeam/                           ← Bạn tạo thủ công (Root)
  ├── An_Nguyen/                    ← Tự động tạo
  │   ├── 2024-11-15/               ← Tự động tạo
  │   │   ├── Code_Review/          ← Tự động tạo
  │   │   │   └── video_1234.mp4   ← Upload
  │   │   ├── Bug_Fix/
  │   │   │   └── video_5678.mp4
  │   ├── 2024-11-16/
  │   │   └── Feature_Development/
  │   │       └── video_9012.mp4
  ├── Binh_Tran/
  │   └── 2024-11-15/
  │       └── Design_Review/
  │           └── video_3456.mp4
```

**Hệ thống sẽ tự động:**
- Tạo folder tên nhân viên nếu chưa có
- Tạo folder ngày (YYYY-MM-DD) nếu chưa có
- Tạo folder tên công việc nếu chưa có
- Upload video vào đúng vị trí

---

## 📝 BƯỚC 6: Cung cấp thông tin cho Developer

### ✅ Checklist thông tin cần có:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com

# Google Drive
VITE_GOOGLE_DRIVE_FOLDER_ID=1ABC123XYZ789

# Optional - Advanced Settings
VITE_MAX_VIDEO_SIZE=524288000  # 500MB in bytes
VITE_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm
```

---

## 🎯 Sau khi có đủ thông tin, tôi sẽ:

### Backend:
- ✅ Thêm `videoUrl` vào WorkLog model
- ✅ Thêm `videoFileId` để track Google Drive file
- ✅ API validate video URL

### Frontend:
- ✅ Tích hợp Google Drive SDK
- ✅ OAuth authentication flow
- ✅ Upload component với:
  - Drag & drop
  - Progress bar
  - Preview thumbnail
- ✅ Video player để xem lại
- ✅ Chỉ hiện upload cho loại employee "Content Creator"

---

## 🛡️ Security Best Practices:

1. **Client ID** - OK để public trong frontend
2. **Client Secret** - KHÔNG bao giờ để trong frontend
3. **Folder ID** - OK để public (đã share rồi)
4. **Access Token** - Được Google SDK handle tự động

---

## 💡 Câu hỏi bổ sung:

### ✅ Đã xác nhận:
- **Folder structure**: VietTeam > Tên Nhân Viên > Ngày > Tên Công Việc > video.mp4
- **Multiple videos**: Chỉ 1 video/work log (có thể thay thế)
- **Video retention**: Giữ mãi mãi, admin xóa thủ công nếu cần

---

## 📞 GỬI CHO TÔI:

**Mẫu reply:**
```
Client ID: [paste here]
Folder ID: [paste here]

Frontend URL production: https://your-domain.vercel.app
Frontend URL local: http://localhost:5173

Folder structure: Option B (mỗi nhân viên 1 folder)
Multiple videos: Option A (1 video/work log)
```

**Khi bạn gửi xong, tôi sẽ implement ngay!** 🚀

---

## 🔍 Cần hỗ trợ setup?

Nếu bạn gặp khó khăn ở bất kỳ bước nào, hãy:
1. Chụp screenshot
2. Nói cho tôi biết bạn đang ở bước nào
3. Tôi sẽ hướng dẫn chi tiết hơn

Hoặc nếu bạn muốn, tôi có thể:
- Tạo script tự động setup (cần gcloud CLI)
- Video tutorial
- Alternative solution (không dùng Google Drive)

