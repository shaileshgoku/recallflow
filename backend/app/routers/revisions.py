"""Revision management routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import date
from app.database import get_db
from app.models.revision import Revision
from app.models.topic import Topic
from app.models.user import User
from app.schemas.revision import RevisionResponse, RevisionComplete, RevisionStatsResponse
from app.services.revision_engine import RevisionEngine
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/revisions", tags=["Revisions"])


def _revision_to_response(rev: Revision, topic: Topic = None) -> dict:
    """Convert revision model to response dict."""
    return {
        "id": rev.id,
        "topic_id": rev.topic_id,
        "topic_title": topic.title if topic else None,
        "topic_category": topic.category.name if topic and topic.category else None,
        "topic_difficulty": topic.difficulty if topic else None,
        "scheduled_date": rev.scheduled_date,
        "completed_date": rev.completed_date,
        "status": rev.status,
        "revision_number": rev.revision_number,
        "day_interval": rev.day_interval,
        "created_at": rev.created_at,
    }


@router.get("/today", response_model=list[RevisionResponse])
async def get_today_revisions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all revisions due today (and overdue)."""
    revisions = await RevisionEngine.get_today_revisions(db, current_user)

    # Load topics for display
    responses = []
    for rev in revisions:
        result = await db.execute(
            select(Topic).options(selectinload(Topic.category)).where(Topic.id == rev.topic_id)
        )
        topic = result.scalar_one_or_none()
        responses.append(_revision_to_response(rev, topic))

    return responses


@router.get("/upcoming", response_model=list[RevisionResponse])
async def get_upcoming_revisions(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get upcoming revisions."""
    revisions = await RevisionEngine.get_upcoming_revisions(db, current_user, days)

    responses = []
    for rev in revisions:
        result = await db.execute(
            select(Topic).options(selectinload(Topic.category)).where(Topic.id == rev.topic_id)
        )
        topic = result.scalar_one_or_none()
        responses.append(_revision_to_response(rev, topic))

    return responses


@router.get("/calendar")
async def get_revision_calendar(
    year: int = Query(default=None),
    month: int = Query(default=None, ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get revision calendar data for a month."""
    today = date.today()
    year = year or today.year
    month = month or today.month
    return await RevisionEngine.get_revision_calendar(db, current_user, year, month)


@router.post("/{revision_id}/complete", response_model=RevisionResponse)
async def complete_revision(
    revision_id: str,
    data: RevisionComplete = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a revision as completed."""
    result = await db.execute(
        select(Revision).where(
            Revision.id == revision_id,
            Revision.user_id == current_user.id,
        )
    )
    revision = result.scalar_one_or_none()
    if not revision:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")

    rating = data.recall_rating if data else None
    await RevisionEngine.complete_revision(db, revision, rating)

    # Load topic for response
    topic_result = await db.execute(
        select(Topic).options(selectinload(Topic.category)).where(Topic.id == revision.topic_id)
    )
    topic = topic_result.scalar_one_or_none()

    return _revision_to_response(revision, topic)


@router.get("/stats", response_model=RevisionStatsResponse)
async def get_revision_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get revision statistics."""
    return await RevisionEngine.get_revision_stats(db, current_user)
