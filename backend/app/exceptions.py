from fastapi import HTTPException

class AppStoreError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)

class PlayStoreError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)

class DatabaseError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=500, detail=detail)

class ReviewFetchError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail) 