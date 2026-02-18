import os

APP_NAME = "Consulting Platform"
APP_VERSION = "0.1.0"

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/consulting_platform",
)

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
JWT_EXPIRES_IN = int(os.environ.get("JWT_EXPIRES_IN", "60"))  # minutes

CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]
