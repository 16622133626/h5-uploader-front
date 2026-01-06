# 部署指南

本文档介绍如何将图片上传系统部署到服务器。

## 部署方式

### 方式一：使用 Docker（推荐）

#### 1. 构建和运行

```bash
# 构建镜像
docker build -t h5-upload .

# 运行容器
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/server/uploads:/app/server/uploads \
  -v $(pwd)/server/data:/app/server/data \
  --name h5-upload \
  h5-upload
```

或者使用 docker-compose：

```bash
docker-compose up -d
```

#### 2. 查看日志

```bash
docker logs -f h5-upload
```

#### 3. 停止服务

```bash
docker stop h5-upload
docker rm h5-upload
```

### 方式二：使用 PM2（Node.js 进程管理）

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 构建前端

```bash
cd /path/to/project
npm install
npm run build
```

#### 3. 配置后端

```bash
cd server
npm install
cp .env.example .env
# 编辑 .env 文件，配置端口和上传目录
```

#### 4. 启动服务

```bash
cd server
pm2 start ecosystem.config.js
```

#### 5. 设置开机自启

```bash
pm2 startup
pm2 save
```

#### 6. 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs h5-upload-server

# 重启
pm2 restart h5-upload-server

# 停止
pm2 stop h5-upload-server
```

### 方式三：使用 Nginx 反向代理

#### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/h5-upload`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 图片文件
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

#### 3. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/h5-upload /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. 配置 SSL（可选）

使用 Let's Encrypt：

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 环境变量配置

### 前端环境变量

创建 `.env` 文件（基于 `.env.example`）：

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 后端环境变量

在 `server/.env` 文件中配置：

```env
PORT=3001
UPLOAD_DIR=./uploads
```

## 文件权限

确保上传目录有写权限：

```bash
mkdir -p server/uploads server/data
chmod 755 server/uploads server/data
```

## 防火墙配置

如果使用云服务器，需要开放端口：

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 3001/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 数据备份

定期备份上传的图片和元数据：

```bash
# 备份脚本示例
#!/bin/bash
BACKUP_DIR="/backup/h5-upload"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz server/uploads/
cp server/data/images.json $BACKUP_DIR/images_$DATE.json
```

## 监控和日志

### 查看应用日志

```bash
# Docker
docker logs -f h5-upload

# PM2
pm2 logs h5-upload-server

# 直接运行
tail -f server/logs/*.log
```

### 监控资源使用

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
```

## 常见问题

### 1. 上传失败

- 检查上传目录权限
- 检查文件大小限制（默认10MB）
- 查看服务器日志

### 2. 图片无法显示

- 检查 API 地址配置
- 检查 CORS 设置
- 检查文件路径是否正确

### 3. 端口被占用

```bash
# 查看端口占用
lsof -i :3001
# 或
netstat -tulpn | grep 3001
```

## 生产环境建议

1. **使用 HTTPS**：配置 SSL 证书
2. **设置文件大小限制**：根据需求调整
3. **定期清理**：删除过期的图片文件
4. **监控磁盘空间**：确保有足够的存储空间
5. **使用 CDN**：加速图片访问（可选）
6. **数据库存储**：生产环境建议使用数据库而非 JSON 文件
7. **用户认证增强**：使用 JWT 等更安全的认证方式






