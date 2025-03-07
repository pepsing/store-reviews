from fastapi import FastAPI, Depends, HTTPException, Header, Response
from sqlalchemy.orm import Session
from . import models, database
from .scrapers import app_store, play_store
from fastapi.middleware.cors import CORSMiddleware
from .exceptions import AppStoreError, DatabaseError, ReviewFetchError
from .logger import setup_logger
from typing import Dict, Any, List, Optional
import traceback
from .config import AUTH_CODE
import csv
import io
from datetime import datetime
import urllib.parse
from pydantic import BaseModel
from .scheduler import update_reviews, update_latest_reviews
import os

# 设置日志
logger = setup_logger("app")

app = FastAPI(
    redirect_slashes=False  # 禁用自动重定向尾部斜杠，避免307重定向
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 本地开发环境
        "https://*.vercel.app",   # Vercel 预览环境
        os.getenv("FRONTEND_URL", ""),  # 生产环境前端 URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 错误处理中间件
@app.middleware("http")
async def error_handling(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"未处理的错误: {str(e)}\n{traceback.format_exc()}")
        return HTTPException(status_code=500, detail="服务器内部错误")

async def verify_auth_code(auth_code: str = Header(..., alias="X-Auth-Code")):
    if auth_code != AUTH_CODE:
        raise HTTPException(status_code=401, detail="授权码无效")
    return auth_code

@app.post("/apps")
def create_app(
    app_data: Dict[str, Any],
    db: Session = Depends(database.get_db),
    auth_code: str = Depends(verify_auth_code)
):
    try:
        logger.info(f"创建新应用: {app_data}")
        new_app = models.App(**app_data)
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        logger.info(f"应用创建成功: {new_app.id}")
        return new_app
    except Exception as e:
        logger.error(f"创建应用失败: {str(e)}\n{traceback.format_exc()}")
        db.rollback()
        raise DatabaseError(f"创建应用失败: {str(e)}")

@app.get("/apps")
def get_apps(db: Session = Depends(database.get_db)):
    try:
        logger.info("获取应用列表")
        apps = db.query(models.App).all()
        return apps
    except Exception as e:
        logger.error(f"获取应用列表失败: {str(e)}\n{traceback.format_exc()}")
        raise DatabaseError(f"获取应用列表失败: {str(e)}")

@app.get("/apps/{app_id}/reviews")
def get_app_reviews(app_id: int, db: Session = Depends(database.get_db)):
    try:
        logger.info(f"获取应用评论: app_id={app_id}")
        app = db.query(models.App).filter(models.App.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="应用不存在")
            
        reviews = db.query(models.Review).filter(models.Review.app_id == app_id).order_by(models.Review.created_at.desc()).all()
        return reviews
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"获取应用评论失败: {str(e)}\n{traceback.format_exc()}")
        raise DatabaseError(f"获取应用评论失败: {str(e)}")

@app.get("/health")
def health_check():
    """健康检查接口"""
    return {"status": "healthy"}

class RefreshRequest(BaseModel):
    platform: Optional[str] = None
    limit: Optional[int] = None

@app.post("/apps/{app_id}/refresh")
async def refresh_app_reviews(
    app_id: int,
    refresh_data: RefreshRequest,
    auth_code: str = Header(..., alias="X-Auth-Code")
):
    """
    刷新应用评论
    :param app_id: 应用ID
    :param platform: 平台（ios/android），不指定则刷新所有平台
    """
    await verify_auth_code(auth_code)
    update_reviews(app_id=app_id, platform=refresh_data.platform)
    return {"message": "更新任务已开始"}

@app.post("/apps/{app_id}/refresh/latest")
async def refresh_latest_reviews(
    app_id: int,
    refresh_data: RefreshRequest,
    auth_code: str = Header(..., alias="X-Auth-Code")
):
    """
    刷新最新评论（默认每个平台100条）
    :param app_id: 应用ID
    :param limit: 限制获取的评论数量
    """
    await verify_auth_code(auth_code)
    limit = refresh_data.limit or 100
    update_latest_reviews(app_id=app_id, limit=limit)
    return {"message": "最新评论更新任务已开始"}

@app.put("/apps/{app_id}")
def update_app(
    app_id: int,
    app_data: Dict[str, Any],
    db: Session = Depends(database.get_db),
    auth_code: str = Depends(verify_auth_code)
):
    try:
        logger.info(f"更新应用: app_id={app_id}, data={app_data}")
        app = db.query(models.App).filter(models.App.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="应用不存在")
        
        for key, value in app_data.items():
            setattr(app, key, value)
        
        db.commit()
        db.refresh(app)
        logger.info(f"应用更新成功: {app_id}")
        return app
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"更新应用失败: {str(e)}\n{traceback.format_exc()}")
        db.rollback()
        raise DatabaseError(f"更新应用失败: {str(e)}")

@app.delete("/apps/{app_id}")
def delete_app(
    app_id: int,
    db: Session = Depends(database.get_db),
    auth_code: str = Depends(verify_auth_code)
):
    try:
        logger.info(f"删除应用: app_id={app_id}")
        app = db.query(models.App).filter(models.App.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="应用不存在")
        
        # 删除关联的评论
        db.query(models.Review).filter(models.Review.app_id == app_id).delete()
        # 删除应用
        db.delete(app)
        db.commit()
        
        logger.info(f"应用删除成功: {app_id}")
        return {"message": "应用删除成功"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"删除应用失败: {str(e)}\n{traceback.format_exc()}")
        db.rollback()
        raise DatabaseError(f"删除应用失败: {str(e)}")

@app.get("/apps/{app_id}/export")
def export_app_reviews(app_id: int, db: Session = Depends(database.get_db)):
    """导出应用评论为CSV格式"""
    try:
        logger.info(f"导出应用评论: app_id={app_id}")
        app = db.query(models.App).filter(models.App.id == app_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="应用不存在")
            
        reviews = db.query(models.Review).filter(models.Review.app_id == app_id).all()
        
        # 创建CSV文件
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 写入表头
        writer.writerow(['ID', '平台', '评分', '评论内容', '作者', '发布时间'])
        
        # 写入数据
        for review in reviews:
            writer.writerow([
                review.id,
                '苹果应用商店' if review.platform == 'ios' else '谷歌应用商店',
                review.rating,
                review.content,
                review.author,
                review.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        # 设置响应
        output.seek(0)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{app.name}_评论_{timestamp}.csv"
        
        # 对文件名进行URL编码，解决中文文件名问题
        encoded_filename = urllib.parse.quote(filename)
        
        response = Response(content=output.getvalue())
        response.headers["Content-Disposition"] = f'attachment; filename="{encoded_filename}"; filename*=UTF-8\'\'{encoded_filename}'
        response.headers["Content-Type"] = "text/csv; charset=utf-8-sig"  # 使用BOM以支持中文
        
        logger.info(f"成功导出应用评论: app_id={app_id}")
        return response
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"导出应用评论失败: {str(e)}\n{traceback.format_exc()}")
        raise DatabaseError(f"导出应用评论失败: {str(e)}")