# 🚀 Hướng Dẫn Deploy Frontend FPT Telecom

Backend đã live tại: `https://fpttelecombinhdinhbe.onrender.com`

## Mục Lục
- [Deploy lên Render (Khuyên dùng - Free)](#deploy-lên-render)
- [Deploy lên Vercel (Nhanh nhất)](#deploy-lên-vercel)
- [Deploy lên Netlify](#deploy-lên-netlify)

---

## 📦 Chuẩn Bị

### 1. Push code lên GitHub (nếu chưa có)

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Kiểm tra file cấu hình

Đảm bảo file `.env.production` đã có với nội dung:
```
VITE_API_BASE_URL=https://fpttelecombinhdinhbe.onrender.com/api
```

---

## 🎯 Deploy lên Render (Khuyên dùng)

### Tại sao chọn Render?
- ✅ Free tier tốt
- ✅ Cùng platform với Backend (giảm latency)
- ✅ Tự động SSL certificate
- ✅ Continuous deployment từ GitHub

### Các bước thực hiện:

#### Bước 1: Đăng nhập Render
1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub account

#### Bước 2: Tạo Static Site mới
1. Click **"New +"** → chọn **"Static Site"**
2. Kết nối với GitHub repository của bạn
3. Cấp quyền cho Render truy cập repo

#### Bước 3: Cấu hình Deploy
Điền thông tin như sau:

| Trường | Giá trị |
|--------|---------|
| **Name** | `fpttelecom-fe` (hoặc tên bạn muốn) |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### Bước 4: Thêm Environment Variables
Click **"Advanced"** và thêm biến môi trường:

```
VITE_API_BASE_URL = https://fpttelecombinhdinhbe.onrender.com/api
NODE_VERSION = 20.11.0
```

#### Bước 5: Cấu hình Rewrites (Quan trọng!)
Trong phần **"Advanced"**, thêm **Rewrite Rules**:

```
Source: /*
Destination: /index.html
```

Điều này đảm bảo React Router hoạt động đúng khi refresh trang.

#### Bước 6: Deploy
1. Click **"Create Static Site"**
2. Render sẽ tự động build và deploy
3. Đợi 3-5 phút để build hoàn tất
4. Bạn sẽ nhận được URL dạng: `https://fpttelecom-fe.onrender.com`

### 🎉 Hoàn tất!

Website của bạn đã live và sẽ tự động deploy lại mỗi khi bạn push code mới lên GitHub!

---

## ⚡ Deploy lên Vercel (Nhanh và dễ nhất)

### Tại sao chọn Vercel?
- ✅ Deploy cực nhanh (1-2 phút)
- ✅ Edge network toàn cầu
- ✅ Free tier rất rộng rãi
- ✅ Tự động preview cho mỗi PR

### Các bước thực hiện:

#### Bước 1: Cài đặt Vercel CLI (Tùy chọn)
```bash
npm install -g vercel
```

#### Bước 2: Deploy qua Vercel Website (Dễ nhất)

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"Add New..."** → **"Project"**
4. Import repository của bạn
5. Vercel sẽ tự động phát hiện Vite configuration

#### Bước 3: Cấu hình

**Framework Preset**: Vite (tự động phát hiện)

**Build & Output Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Bước 4: Environment Variables
Thêm biến môi trường:

```
VITE_API_BASE_URL = https://fpttelecombinhdinhbe.onrender.com/api
```

#### Bước 5: Deploy
1. Click **"Deploy"**
2. Đợi 1-2 phút
3. Nhận URL: `https://fpttelecom-fe.vercel.app`

### 🎯 Deploy qua CLI (Nhanh hơn)

```bash
# Đăng nhập
vercel login

# Deploy production
vercel --prod

# Làm theo hướng dẫn trên terminal
```

---

## 🌐 Deploy lên Netlify

### Các bước thực hiện:

#### Bước 1: Tạo file cấu hình Netlify
Tạo file `netlify.toml` ở root folder:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20.11.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Bước 2: Deploy qua Netlify Website

1. Truy cập: https://netlify.com
2. Đăng nhập bằng GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Chọn repository

#### Bước 3: Cấu hình Build

Netlify sẽ tự động phát hiện từ `netlify.toml`, nhưng kiểm tra lại:

- Build command: `npm run build`
- Publish directory: `dist`

#### Bước 4: Environment Variables

Thêm:
```
VITE_API_BASE_URL = https://fpttelecombinhdinhbe.onrender.com/api
```

#### Bước 5: Deploy
1. Click **"Deploy site"**
2. Nhận URL: `https://fpttelecom-fe.netlify.app`

---

## 🔧 Kiểm Tra Sau Deploy

### 1. Kiểm tra API connection
Mở DevTools (F12) → Console, kiểm tra xem có lỗi kết nối API không

### 2. Test các chức năng chính
- ✅ Login/Register
- ✅ Xem danh sách gói cước
- ✅ Đăng ký nhanh
- ✅ Chatbot
- ✅ Admin dashboard (nếu có)

### 3. Test trên mobile
Mở website trên điện thoại để kiểm tra responsive

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi 1: "Network Error" hoặc không kết nối được API

**Nguyên nhân**: URL API không đúng

**Giải pháp**:
1. Kiểm tra environment variable `VITE_API_BASE_URL`
2. Đảm bảo có `/api` ở cuối: `https://fpttelecombinhdinhbe.onrender.com/api`
3. Kiểm tra backend có bật CORS cho frontend domain

### Lỗi 2: "404 Not Found" khi refresh trang

**Nguyên nhân**: Chưa cấu hình rewrite rules cho SPA

**Giải pháp**:
- **Render**: Thêm rewrite rule `/* → /index.html`
- **Vercel**: Tự động xử lý
- **Netlify**: Thêm redirect trong `netlify.toml`

### Lỗi 3: Build failed - "out of memory"

**Nguyên nhân**: Build quá lớn

**Giải pháp**:
```bash
# Thay đổi build command thành:
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Lỗi 4: Environment variables không hoạt động

**Nguyên nhân**: Vite yêu cầu prefix `VITE_`

**Giải pháp**:
- Đảm bảo tất cả biến môi trường bắt đầu bằng `VITE_`
- VD: `VITE_API_BASE_URL` (đúng) vs `API_BASE_URL` (sai)

---

## 🔐 CORS Configuration (Backend)

Đảm bảo backend của bạn cho phép frontend domain. Trong C# ASP.NET Core:

```csharp
// Program.cs hoặc Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://fpttelecom-fe.onrender.com",
            "https://fpttelecom-fe.vercel.app",
            "https://fpttelecom-fe.netlify.app",
            "http://localhost:5173" // for development
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

---

## 📊 So Sánh Các Platform

| Tiêu chí | Render | Vercel | Netlify |
|----------|--------|--------|---------|
| **Tốc độ deploy** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Free tier** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Dễ setup** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Tốc độ website** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Custom domain** | ✅ Free | ✅ Free | ✅ Free |
| **SSL Certificate** | ✅ Auto | ✅ Auto | ✅ Auto |

### Khuyến nghị:
- **Dùng Vercel**: Nếu ưu tiên tốc độ và performance
- **Dùng Render**: Nếu muốn cùng platform với backend
- **Dùng Netlify**: Nếu cần nhiều tính năng forms/functions

---

## 🎓 Tips Nâng Cao

### 1. Custom Domain
Sau khi deploy, bạn có thể thêm custom domain:
- Mua domain tại: Namecheap, GoDaddy, hoặc Cloudflare
- Thêm DNS records trỏ về platform của bạn
- Tất cả 3 platform đều hỗ trợ free SSL

### 2. Performance Optimization
```bash
# Analyze bundle size
npm run build -- --mode production

# Check bundle visualization (thêm vào package.json nếu cần)
npm install -D rollup-plugin-visualizer
```

### 3. Monitoring
- **Vercel**: Built-in analytics
- **Render**: Metrics dashboard
- **Netlify**: Analytics addon

### 4. Preview Deployments
Tất cả 3 platforms đều tự động tạo preview URL cho mỗi pull request!

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Build logs trên platform
2. Browser console (F12)
3. Network tab để xem API requests
4. Backend logs

---

## ✅ Checklist Trước Khi Deploy

- [ ] Code đã push lên GitHub
- [ ] File `.env.production` có đúng URL backend
- [ ] Backend đã cấu hình CORS cho frontend domain
- [ ] Đã test build local: `npm run build && npm run preview`
- [ ] Đã chọn platform deploy (Render/Vercel/Netlify)
- [ ] Đã setup environment variables trên platform

---

## 🚀 Quick Start (Nhanh nhất - Vercel)

```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Làm theo hướng dẫn trên terminal
# 4. Done! Nhận URL trong 2 phút
```

---

**Chúc bạn deploy thành công! 🎉**

Backend: ✅ https://fpttelecombinhdinhbe.onrender.com  
Frontend: 🚀 Sắp live!
