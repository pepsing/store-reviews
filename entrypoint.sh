#!/bin/sh
# 确保static目录存在
mkdir -p /app/static
# 复制前端构建文件到static目录
cp -rf /app/frontend_build/* /app/static/

# 初始化数据库
echo "正在初始化数据库..."
export PYTHONPATH="/app"
python /app/app/database/init_db.py

# 启动应用
exec uvicorn app.main:app --host 0.0.0.0 --port 8000