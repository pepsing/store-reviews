# 基础镜像
FROM node:16 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps --force
COPY frontend/ .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装后端依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ .

# 复制前端构建文件到临时目录
COPY --from=frontend-build /app/frontend/build /app/frontend_build

# 添加启动脚本
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["/app/entrypoint.sh"]