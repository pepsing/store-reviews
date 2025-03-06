from os import getenv

DATABASE_URL = getenv("DATABASE_URL", "sqlite:///./app.db")
AUTH_CODE = getenv("AUTH_CODE", "admin123")  # 默认授权码 