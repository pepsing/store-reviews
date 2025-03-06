from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.models import Base, App, Review
from app.config import DATABASE_URL

def init_db():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # 检查表是否已存在
    if not inspector.has_table("apps"):
        print("检测到数据库表不存在，正在创建新表...")
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
    else:
        print("数据库表已存在，无需初始化。")

if __name__ == "__main__":
    init_db()