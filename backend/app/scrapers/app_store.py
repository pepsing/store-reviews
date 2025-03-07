from app_store_scraper import AppStore
from datetime import datetime
from typing import List, Dict, Any
from ..logger import setup_logger
from ..exceptions import AppStoreError
from functools import wraps

logger = setup_logger("app_store_scraper")

def fetch_reviews(app_id: str, country: str = "cn", limit: int = None) -> List[Dict[str, Any]]:
    """
    获取 App Store 评论
    :param app_id: App Store ID
    :param country: 国家/地区代码
    :param limit: 限制获取的评论数量
    """
    try:
        logger.info(f"开始获取 App Store 评论: app_id={app_id}, country={country}, limit={limit}")
        
        # 检查 app_id 格式
        if not app_id.isdigit():
            raise ValueError(f"无效的 App Store ID: {app_id}")
        
        app = AppStore(
            country=country.lower(),
            app_id=app_id,
            app_name="temp"  # app_name 是必需的，但实际上我们不需要它
        )
        
        # 打印请求信息
        logger.info(f"App Store 请求参数: country={country}, app_id={app_id}, limit={limit}")
        # 获取评论前记录
        logger.info("开始发送 App Store 评论请求...")
        how_many = min(limit, 3000) if limit else 3000  # 限制最大获取数量为3000
        app.review(how_many=how_many)
        logger.info(f"App Store 评论请求完成，评论数={app.reviews_count}")
        reviews = []
        
        for review in app.reviews:
            # 检查日期格式
            created_at = review['date']
            if isinstance(created_at, str):
                created_at = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
            elif not isinstance(created_at, datetime):
                logger.warning(f"未知的日期格式: {created_at}, type: {type(created_at)}")
                continue
            
            reviews.append({
                'platform': 'ios',
                'rating': review['rating'],
                'content': review['review'],
                'author': review['userName'],
                'created_at': created_at
            })
            
            if limit and len(reviews) >= limit:
                break
        
        logger.info(f"成功获取 {len(reviews)} 条 App Store 评论")
        return reviews
        
    except Exception as e:
        logger.error(f"从 App Store 获取评论失败: {str(e)}")
        raise AppStoreError(f"从 App Store 获取评论失败: {str(e)}") 