# 手机访问配置指南

## 配置步骤

### 1. 启动开发服务器

#### 前端（Vite）
```bash
npm run dev
```

启动后会显示：
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

#### 后端（Express）
```bash
cd server
npm start
# 或开发模式
npm run dev
```

### 2. 获取本机IP地址

#### Windows
```bash
ipconfig
```
查找 "IPv4 地址"，例如：`192.168.1.100`

#### Mac/Linux
```bash
ifconfig
# 或
ip addr show
```
查找局域网IP，通常在 `192.168.x.x` 或 `10.0.x.x`

### 3. 手机访问

1. **确保手机和电脑在同一WiFi网络**

2. **在手机浏览器输入：**
   ```
   http://你的IP地址:3000
   ```
   例如：`http://192.168.1.100:3000`

3. **如果无法访问，检查：**
   - 防火墙是否允许端口 3000 和 3001
   - 手机和电脑是否在同一网络
   - IP地址是否正确

### 4. 配置后端API地址（重要）

如果手机访问时无法加载图片，需要配置后端API地址：

#### 方法一：使用环境变量（推荐）

创建 `.env` 文件（在项目根目录）：
```env
VITE_API_BASE_URL=http://你的IP地址:3001
```

例如：
```env
VITE_API_BASE_URL=http://192.168.1.100:3001
```

然后重启前端服务器：
```bash
npm run dev
```

#### 方法二：修改代码（临时）

编辑 `src/utils/api.js`，将：
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)
```

改为：
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://你的IP地址:3001' : window.location.origin)
```

### 5. 防火墙配置

#### Windows
1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 点击"入站规则" → "新建规则"
4. 选择"端口" → 下一步
5. 选择"TCP"，输入端口 `3000` 和 `3001`
6. 允许连接 → 完成

#### Mac
```bash
# 允许端口 3000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### 6. 常见问题

#### 问题1：手机无法访问
- 检查手机和电脑是否在同一WiFi
- 检查防火墙设置
- 尝试关闭防火墙测试

#### 问题2：图片无法加载
- 确保后端服务器正在运行
- 检查 `VITE_API_BASE_URL` 配置是否正确
- 在手机浏览器中打开开发者工具查看错误

#### 问题3：端口被占用
- 修改 `vite.config.js` 中的端口号
- 或使用 `--port` 参数：`npm run dev -- --port 3001`

### 7. 快速测试

在手机浏览器访问：
- 前端：`http://你的IP:3000`
- 后端健康检查：`http://你的IP:3001/api/health`

如果健康检查返回 `{"status":"ok"}`，说明后端正常。

## 生产环境部署

生产环境部署后，手机可以通过域名或公网IP访问，无需额外配置。

