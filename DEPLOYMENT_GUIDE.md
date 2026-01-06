# 部署指南 - 支持多设备访问

## 问题说明

当前图片存储在服务器本地，手机访问时可能无法显示图片。解决方案：

1. **短期方案**：修复API地址自动检测（已完成）
2. **长期方案**：使用云存储 + 部署到服务器

## 方案一：云存储 + 服务器部署（推荐）

### 1. 使用云存储服务

#### 阿里云OSS（推荐）
- 免费额度：每月5GB存储 + 5GB流量
- 价格便宜，国内访问快
- 支持CDN加速

#### 腾讯云COS
- 免费额度：每月50GB存储
- 国内访问速度快

#### 七牛云
- 免费额度：每月10GB存储
- 简单易用

### 2. 集成云存储

需要修改 `server/index.js`，将图片上传到云存储而不是本地。

### 3. 部署方案

#### 前端部署
- **GitHub Pages**：免费，但只能部署静态文件
- **Vercel**：免费，自动部署，支持环境变量
- **Netlify**：免费，自动部署

#### 后端部署
- **Railway**：免费额度，支持Node.js
- **Render**：免费，支持Node.js
- **Vercel Serverless**：免费，但需要改造为Serverless函数
- **自己的服务器**：VPS、云服务器

## 方案二：修复当前问题（临时方案）

### 已完成的修复

1. ✅ API地址自动检测
2. ✅ 图片URL自动构建

### 使用步骤

1. **启动服务器**
   ```bash
   # 前端
   npm run dev
   
   # 后端
   cd server
   npm start
   ```

2. **获取IP地址**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

3. **手机访问**
   - 确保手机和电脑在同一WiFi
   - 访问：`http://你的IP:3000`

4. **如果图片还是不显示**
   - 检查后端是否在运行
   - 检查防火墙是否开放3001端口
   - 在手机浏览器控制台查看错误信息

## 方案三：完整部署到服务器

### 步骤

1. **购买服务器**
   - 阿里云、腾讯云、华为云等
   - 最低配置：1核1G即可

2. **部署后端**
   ```bash
   # 上传代码到服务器
   scp -r . user@server:/path/to/app
   
   # 安装依赖
   cd server
   npm install
   
   # 使用PM2运行
   pm2 start ecosystem.config.js
   ```

3. **部署前端**
   ```bash
   # 构建前端
   npm run build
   
   # 将dist目录部署到Nginx或上传到GitHub Pages
   ```

4. **配置Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # 前端
       location / {
           root /path/to/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # 后端API
       location /api {
           proxy_pass http://localhost:3001;
       }
       
       # 图片
       location /uploads {
           proxy_pass http://localhost:3001;
       }
   }
   ```

## 方案四：GitHub Pages + 后端服务

### 限制
- GitHub Pages 只能部署静态前端
- 需要单独部署后端API
- 图片需要存储到云存储

### 步骤

1. **前端部署到GitHub Pages**
   ```bash
   npm run build
   # 将dist目录内容推送到gh-pages分支
   ```

2. **后端部署到Railway/Render**
   - 连接GitHub仓库
   - 自动部署
   - 获取后端API地址

3. **配置环境变量**
   - 在GitHub Pages设置中添加 `VITE_API_BASE_URL`
   - 值为后端API地址

4. **图片存储到云存储**
   - 修改后端代码，上传到OSS/COS
   - 返回云存储的URL

## 推荐方案

### 小型项目（推荐）
1. **前端**：Vercel（免费，自动部署）
2. **后端**：Railway（免费额度）
3. **图片存储**：阿里云OSS（免费额度）

### 预算充足
1. **服务器**：阿里云/腾讯云（1核2G，约50元/月）
2. **图片存储**：阿里云OSS + CDN
3. **域名**：备案后使用

## 快速修复当前问题

如果只是临时使用，确保：

1. ✅ 后端服务器运行在 `0.0.0.0:3001`
2. ✅ 防火墙开放3001端口
3. ✅ 手机和电脑在同一网络
4. ✅ 使用IP地址访问，不是localhost

代码已自动检测IP地址，应该可以正常显示图片了。

