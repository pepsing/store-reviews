from app_store_scraper import AppStore
from datetime import datetime
from typing import List, Dict, Any
from ..logger import setup_logger
from ..exceptions import AppStoreError
import requests
from functools import wraps

logger = setup_logger("app_store_scraper")

def log_request(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 保存原始的 request 方法
        original_request = requests.request
        
        def request_logger(method, url, **request_kwargs):
            logger.info(f"发送请求: {method} {url}")
            logger.info(f"请求头: {request_kwargs.get('headers', {})}")
            if 'data' in request_kwargs:
                logger.info(f"请求体: {request_kwargs['data']}")
            response = original_request(method, url, **request_kwargs)
            logger.info(f"响应状态: {response.status_code}")
            return response
        
        # 替换 requests.request 方法
        requests.request = request_logger
        try:
            return func(*args, **kwargs)
        finally:
            # 恢复原始的 request 方法
            requests.request = original_request
    return wrapper

@log_request
def fetch_reviews(app_id: str, country: str = "cn") -> List[Dict[str, Any]]:
    """获取 App Store 评论"""
    try:
        logger.info(f"开始获取 App Store 评论: app_id={app_id}, country={country}")
        # 构建 App Store URL
        app_store_url = f"https://apps.apple.com/{country}/app/id{app_id}"
        logger.info(f"App Store URL: {app_store_url}")
        
        # 检查 app_id 格式
        if not app_id.isdigit():
            raise ValueError(f"无效的 App Store ID: {app_id}")
        
        app = AppStore(
            country=country.lower(),
            app_id=app_id,
            app_name="temp"  # app_name 是必需的，但实际上我们不需要它
        )
        
        # 打印请求信息
        logger.info(f"App Store 请求参数: country={country}, app_id={app_id}")
        # 获取评论前记录
        logger.info("开始发送 App Store 评论请求...")
        app.review(how_many=50)  # 限制获取的评论数量
        logger.info("App Store 评论请求完成")
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
        
        logger.info(f"成功获取 {len(reviews)} 条 App Store 评论")
        return reviews
        
    except Exception as e:
        logger.error(f"从 App Store 获取评论失败: {str(e)}")
        raise AppStoreError(f"从 App Store 获取评论失败: {str(e)}") 