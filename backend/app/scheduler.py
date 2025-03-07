from apscheduler.schedulers.background import BackgroundScheduler
from .scrapers import app_store, play_store
from .database import SessionLocal
from .models import Review
from .logger import setup_logger
from datetime import datetime
import traceback

logger = setup_logger("scheduler")

def update_reviews():
    db = SessionLocal()
    try:
        logger.info("开始更新应用评论")
        apps = db.query(models.App).all()
        
        for app in apps:
            try:
                # 获取 App Store 评论
                if app.platform in ['ios', 'both'] and app.app_store_id:
                    logger.info(f"更新 App Store 评论: app_id={app.id}")
                    reviews = app_store.fetch_reviews(app.app_store_id, country=app.app_store_country)
                    save_reviews(db, app.id, reviews)

                # 获取 Google Play 评论
                if app.platform in ['android', 'both'] and app.play_store_id:
                    logger.info(f"更新 Google Play 评论: app_id={app.id}")
                    reviews = play_store.fetch_reviews(app.play_store_id, country=app.play_store_country)
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
scheduler.add_job(update_reviews, 'interval', hours=24)
scheduler.start() 