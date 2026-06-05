"""Authentication routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, TokenRefresh, UserResponse
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    return await AuthService.register(db, user_data)


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get access token."""
    return await AuthService.login(db, login_data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    return await AuthService.refresh_token(db, data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserResponse.model_validate(current_user)
