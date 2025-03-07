from apscheduler.schedulers.background import BackgroundScheduler
from .scrapers import app_store, play_store
from .database import SessionLocal
from .models import Review, App
from .logger import setup_logger
from datetime import datetime, timedelta
from sqlalchemy import desc
import traceback

logger = setup_logger("scheduler")

def update_reviews(app_id: int = None, platform: str = None, limit: int = None):
    """
    更新应用评论
    :param app_id: 指定应用ID，为None时更新所有应用
    :param platform: 指定平台 (ios/android)，为None时更新所有平台
    :param limit: 限制获取的评论数量
    """
    db = SessionLocal()
    try:
        logger.info(f"开始更新应用评论: app_id={app_id}, platform={platform}, limit={limit}")
        
        # 查询需要更新的应用
        query = db.query(App)
        if app_id:
            query = query.filter(App.id == app_id)
        apps = query.all()
        
        for app in apps:
            try:
                # 获取 App Store 评论
                if (platform in [None, 'ios'] and 
                    app.platform in ['ios', 'both'] and 
                    app.app_store_id):
                    logger.info(f"更新 App Store 评论: app_id={app.id}")
                    reviews = app_store.fetch_reviews(
                        app.app_store_id, 
                        country=app.app_store_country,
                        limit=limit
                    )
                    save_reviews(db, app.id, reviews)

                # 获取 Google Play 评论
                if (platform in [None, 'android'] and 
                    app.platform in ['android', 'both'] and 
                    app.play_store_id):
                    logger.info(f"更新 Google Play 评论: app_id={app.id}")
                    reviews = play_store.fetch_reviews(
                        app.play_store_id, 
                        country=app.play_store_country,
                        limit=limit
                    )
                    save_reviews(db, app.id, reviews)

            except Exception as e:
                logger.error(f"更新应用 {app.id} 的评论失败: {str(e)}\n{traceback.format_exc()}")
                continue

        logger.info("评论更新完成")
        
    except Exception as e:
        logger.error(f"更新评论时出错: {str(e)}\n{traceback.format_exc()}")
        db.rollback()
    finally:
        db.close()

def update_latest_reviews(app_id: int, limit: int = 100):
    """
    更新最新的评论
    :param app_id: 应用ID
    :param limit: 获取的评论数量限制
    """
    update_reviews(app_id=app_id, limit=limit)

def save_reviews(db, app_id: int, reviews: list):
    """保存评论到数据库"""
    for review_data in reviews:
        try:
            existing_review = db.query(Review).filter(
                Review.app_id == app_id,
                Review.platform == review_data['platform'],
                Review.author == review_data['author'],
                Review.created_at == review_data['created_at']
            ).first()
            
            if not existing_review:
                new_review = Review(app_id=app_id, **review_data)
                db.add(new_review)
                db.commit()
                
        except Exception as e:
            logger.error(f"保存评论失败: {str(e)}")
            db.rollback()

# 创建定时任务
scheduler = BackgroundScheduler()
# 每天凌晨2点增量更新最新评论
scheduler.add_job(
    lambda: update_reviews(limit=100),  # 每个平台获取最新100条评论
    'cron',
    hour=2,  # 凌晨2点执行
    minute=0,
    next_run_time=datetime.now() + timedelta(minutes=5)  # 启动5分钟后执行第一次
)
scheduler.start() 