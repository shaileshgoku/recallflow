"""Active recall routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.topic import Topic
from app.schemas.recall import RecallStart, RecallSubmit, RecallSessionResponse
from app.services.recall_service import RecallService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/recall", tags=["Active Recall"])


@router.post("/start", response_model=RecallSessionResponse)
async def start_recall(
    data: RecallStart,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new active recall session."""
    session = await RecallService.start_session(
        db, current_user, data.topic_id, data.revision_id
    )

    # Get topic title
    topic_result = await db.execute(select(Topic).where(Topic.id == data.topic_id))
    topic = topic_result.scalar_one_or_none()

    return RecallSessionResponse(
        id=session.id,
        topic_id=session.topic_id,
        topic_title=topic.title if topic else None,
        recall_rating=session.recall_rating or "",
        user_answer=session.user_answer,
        time_spent_seconds=session.time_spent_seconds,
        started_at=session.started_at,
        completed_at=session.completed_at,
    )


@router.post("/submit", response_model=RecallSessionResponse)
async def submit_recall(
    data: RecallSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit recall answer and self-rating."""
    session = await RecallService.submit_session(
        db, current_user, data.session_id, data.user_answer, data.recall_rating, data.time_spent_seconds
    )

    topic_result = await db.execute(select(Topic).where(Topic.id == session.topic_id))
    topic = topic_result.scalar_one_or_none()

    return RecallSessionResponse(
        id=session.id,
        topic_id=session.topic_id,
        topic_title=topic.title if topic else None,
        recall_rating=session.recall_rating,
        user_answer=session.user_answer,
        time_spent_seconds=session.time_spent_seconds,
        started_at=session.started_at,
        completed_at=session.completed_at,
    )


@router.get("/history")
async def get_recall_history(
    topic_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recall session history."""
    history = await RecallService.get_history(db, current_user, topic_id, limit)

    # Enrich sessions with topic titles
    sessions = []
    for s in history["sessions"]:
        topic_result = await db.execute(select(Topic).where(Topic.id == s.topic_id))
        topic = topic_result.scalar_one_or_none()
        sessions.append(RecallSessionResponse(
            id=s.id,
            topic_id=s.topic_id,
            topic_title=topic.title if topic else None,
            recall_rating=s.recall_rating,
            user_answer=s.user_answer,
            time_spent_seconds=s.time_spent_seconds,
            started_at=s.started_at,
            completed_at=s.completed_at,
        ))

    return {
        "sessions": sessions,
        "total": history["total"],
        "average_time_seconds": history["average_time_seconds"],
        "accuracy_rate": history["accuracy_rate"],
    }
