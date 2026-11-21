import os
import pymysql

# DB 연결 함수
def connect_DB():
    con = pymysql.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=int(os.getenv('DB_PORT', '3306')),
        user=os.getenv('DB_USER', 'pa'),
        password=os.getenv('DB_PASSWORD', '1234'),
        #charset='',
        db=os.getenv('DB_NAME', 'pa'),
        charset='utf8mb4',
        connect_timeout=10,
    )
    return con
