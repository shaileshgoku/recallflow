"""Analytics routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.revision_engine import RevisionEngine
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard overview statistics."""
    return await AnalyticsService.get_overview(db, current_user)


@router.get("/heatmap")
async def get_heatmap(
    days: int = Query(365, ge=30, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity heatmap data."""
    return await AnalyticsService.get_heatmap(db, current_user, days)


@router.get("/category-breakdown")
async def get_category_breakdown(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics per category."""
    return await AnalyticsService.get_category_breakdown(db, current_user)


@router.get("/daily-accuracy")
async def get_daily_accuracy(
    days: int = Query(30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get daily recall accuracy."""
    return await AnalyticsService.get_daily_accuracy(db, current_user, days)


@router.get("/difficulty-distribution")
async def get_difficulty_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get topic difficulty distribution."""
    return await AnalyticsService.get_difficulty_distribution(db, current_user)


@router.get("/weak-topics")
async def get_weak_topics(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get weakest topics by memory strength."""
    return await AnalyticsService.get_weak_topics(db, current_user, limit)


@router.get("/streaks")
async def get_streaks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get streak information."""
    return await RevisionEngine.get_streak(db, current_user)
