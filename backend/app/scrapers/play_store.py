from google_play_scraper import Sort, reviews_all, reviews
from datetime import datetime, timezone
from typing import List, Dict, Any
from ..logger import setup_logger
from ..exceptions import PlayStoreError

logger = setup_logger("play_store_scraper")

def fetch_reviews(app_id: str, country: str = "cn") -> List[Dict[str, Any]]:
    """
    从 Google Play 抓取评论数据
    
    参数:
        app_id: Play Store ID
        country: 国家/地区代码
    """
    try:
        logger.info(f"开始获取 Play Store 评论: app_id={app_id}, country={country}")
        
        # 国家代码映射
        country_lang = {
            "cn": ("cn", "zh-CN"),
            "us": ("us", "en-US"),
            "jp": ("jp", "ja-JP"),
            "kr": ("kr", "ko-KR"),
            "hk": ("hk", "zh-HK"),
            "tw": ("tw", "zh-TW"),
            "sg": ("sg", "en-SG"),
            "my": ("my", "ms-MY"),
            "id": ("id", "id-ID"),
            "ph": ("ph", "en-PH"),
            "mm": ("mm", "my-MM"),
            "th": ("th", "th-TH"),
            "vn": ("vn", "vi-VN")
        }
        
        country_code, lang = country_lang.get(country.lower(), ("us", "en-US"))
        
        # 打印请求参数
        logger.info(f"Play Store 请求参数: lang={lang}, country={country_code}, sort=newest, count=7000")
        # 获取评论前记录
        logger.info("开始发送 Play Store 评论请求...")
        # result = reviews_all(
        #     app_id,
        #     lang=lang,
        #     country=country_code,
        #     sort=Sort.MOST_RELEVANT,
        #     count=50
        # )
        result, _ = reviews(
            app_id,
            count=7000,
            continuation_token=None # defaults to None(load from the beginning)
        )
        logger.info("Play Store 评论请求完成")
        
        app_reviews = []
        for review in result:
            try:
                # 确保 review['at'] 是时间戳
                timestamp = review['at']
                if isinstance(timestamp, datetime):
                    timestamp = int(timestamp.replace(tzinfo=timezone.utc).timestamp())
                
                app_reviews.append({
                    'platform': 'android',
                    'rating': review['score'],
                    'content': review['content'],
                    'author': review['userName'],
                    'created_at': datetime.fromtimestamp(timestamp)
                })
            except Exception as e:
                logger.warning(f"处理评论时出错: {str(e)}, review={review}")
                continue
        
        logger.info(f"成功获取 {len(app_reviews)} 条 Play Store 评论")
        return app_reviews
        
    except Exception as e:
        logger.error(f"从 Play Store 获取评论失败: {str(e)}")
        raise PlayStoreError(f"从 Play Store 获取评论失败: {str(e)}") 