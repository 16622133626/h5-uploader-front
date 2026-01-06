# 多阶段构建：前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 多阶段构建：后端
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

COPY server/package*.json ./
RUN npm install

COPY server/ .

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 复制后端文件
COPY --from=backend-builder /app/backend /app/server
# 复制前端构建文件
COPY --from=frontend-builder /app/frontend/dist /app/server/public

WORKDIR /app/server

# 创建必要的目录
RUN mkdir -p uploads data

EXPOSE 3001

CMD ["node", "index.js"]






