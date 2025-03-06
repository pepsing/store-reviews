from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..models import Base, App, Review
from ..config import DATABASE_URL

def init_db():
    engine = create_engine(DATABASE_URL)
    
    # 删除所有现有表
    Base.metadata.drop_all(bind=engine)
    
    # 创建新表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 添加示例数据
        sample_apps = [
            App(
                name="示例 iOS 应用",
                platform="ios",
                app_store_id="123456789",
                app_store_country="cn",
            ),
            App(
                name="示例 Android 应用",
                platform="android",
                play_store_id="com.example.app",
                play_store_country="cn",
            ),
            App(
                name="示例双平台应用",
                platform="both",
                app_store_id="987654321",
                play_store_id="com.example.both",
                app_store_country="cn",
                play_store_country="cn",
            ),
        ]
        
        db.add_all(sample_apps)
        db.commit()
        
        print("数据库初始化成功！")
        
    except Exception as e:
        print(f"初始化数据库时出错: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 