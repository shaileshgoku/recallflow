"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "RecallFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database - defaults to SQLite for local development
    # For production, set to: postgresql+asyncpg://user:password@host:5432/recallflow
    DATABASE_URL: str = "sqlite+aiosqlite:///./recallflow.db"

    # JWT
    JWT_SECRET_KEY: str = "recallflow-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ]

    # Email (placeholder)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
