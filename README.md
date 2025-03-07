# Store Reviews

一个用于监控和管理 App Store 和 Google Play Store 应用评论的工具。

## 功能特点

- 支持 iOS 和 Android 双平台
- 实时抓取最新评论
- 分平台独立更新评论
- 增量更新最新评论
- 评分趋势图表展示
- 多国家/地区支持
- 评论分页和展开/收起
- 授权码保护

## 技术栈

### 前端
- React
- TypeScript
- Ant Design
- Recharts (图表)
- Axios

### 后端
- FastAPI
- SQLAlchemy
- app-store-scraper
- google-play-scraper

## 快速开始

### 开发环境

1. 克隆仓库
```bash
git clone <repository-url>
cd store-reviews
```

2. 安装前端依赖
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm install
npm start
```

3. 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. 初始化数据库
```bash
python -m app.database.init_db
```

5. 启动后端服务
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 生产环境部署

1. 设置环境变量
```bash
echo "AUTH_CODE=your_secure_code" > .env
```

2. 使用 Docker Compose 部署
```bash
docker-compose up -d --build
```

## 配置说明

### 环境变量
- `AUTH_CODE`: 管理操作授权码（默认：admin123）
- `DATABASE_URL`: 数据库连接 URL（默认：sqlite:///./app.db）

### 端口
- 后端 API: 8000
- 前端页面: 8080

## API 文档

### 主要接口
- `GET /api/apps`: 获取应用列表
- `POST /api/apps`: 添加新应用
- `PUT /api/apps/{app_id}`: 更新应用信息
- `DELETE /api/apps/{app_id}`: 删除应用
- `GET /api/apps/{app_id}/reviews`: 获取应用评论
- `POST /api/apps/{app_id}/refresh`: 刷新应用评论
  - 参数：
    - `platform`: 可选，指定平台（ios/android）
    - `limit`: 可选，限制获取的评论数量
- `POST /api/apps/{app_id}/refresh/latest`: 刷新最新评论
  - 参数：
    - `limit`: 可选，限制获取的评论数量（默认100条）
- `GET /api/apps/{app_id}/export`: 导出评论为 CSV

### 自动更新
系统会在每天凌晨 2 点自动获取每个应用最新的 100 条评论。

### 授权
需要在请求头中添加 `X-Auth-Code` 进行授权：
```bash
curl -H "X-Auth-Code: your_auth_code" -X POST http://localhost:8000/api/apps
```

## 支持的国家/地区

- 中国 (cn)
- 美国 (us)
- 日本 (jp)
- 韩国 (kr)
- 香港 (hk)
- 台湾 (tw)
- 新加坡 (sg)
- 马来西亚 (my)
- 印度尼西亚 (id)
- 菲律宾 (ph)
- 缅甸 (mm)
- 泰国 (th)
- 越南 (vn)

## 目录结构

```
store-reviews/
├── backend/
│   ├── app/
│   │   ├── scrapers/
│   │   ├── database/
│   │   ├── models.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── nginx.conf
```

## 常见问题

1. 数据库在哪里？
   - 数据存储在 `./data/app.db`

2. 如何备份数据？
```bash
docker-compose exec app cp /app/data/app.db /app/data/backup/app.db.$(date +%Y%m%d)
```

3. 如何更新应用？
```bash
git pull
#docker-compose build --build-arg https_proxy=http://192.168.196.88:7897  --build-arg http_proxy=http://192.168.196.88:7897
docker-compose build
docker-compose up -d
```

## 维护命令

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d
```

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 联系方式

如有问题，请提交 Issue 或联系维护者。

