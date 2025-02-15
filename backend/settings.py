INSTALLED_APPS = [
    # ... 其他应用 ...
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # 需要放在最前面
    # ... 其他中间件 ...
]

# CORS设置
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vue前端地址
    "http://127.0.0.1:5173",
    "http://localhost:8081",  # 模型管理页面地址
    "http://127.0.0.1:8081",
]

# CSRF设置
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]
