from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class App(Base):
    __tablename__ = "apps"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    platform = Column(String)  # ios, android, both
    app_store_id = Column(String, nullable=True)
    play_store_id = Column(String, nullable=True)
    app_store_country = Column(String, default="cn")  # 新增字段，默认为中国
    play_store_country = Column(String, default="cn")  # 新增字段，默认为中国
    
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True)
    app_id = Column(Integer, ForeignKey("apps.id"))
    platform = Column(Enum('ios', 'android'), nullable=False)
    rating = Column(Float, nullable=False)
    content = Column(String)
    author = Column(String) # 用户名
    created_at = Column(DateTime(timezone=True), nullable=False) 