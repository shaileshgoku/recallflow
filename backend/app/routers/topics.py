"""Topic management routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.schemas.topic import (
    TopicCreate,
    TopicUpdate,
    TopicResponse,
    TopicListResponse,
    CategoryCreate,
    CategoryResponse,
)
from app.services.topic_service import TopicService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/topics", tags=["Topics"])


@router.get("", response_model=TopicListResponse)
async def list_topics(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    category_id: Optional[str] = None,
    mastered: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List topics with search, filter, and pagination."""
    return await TopicService.get_topics(
        db, current_user, page, per_page, search, difficulty, category_id, mastered
    )


@router.post("", response_model=TopicResponse, status_code=201)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new topic with automatic revision scheduling."""
    return await TopicService.create_topic(db, current_user, data)


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all user categories."""
    categories = await TopicService.get_categories(db, current_user)
    return [CategoryResponse.model_validate(c) for c in categories]


@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single topic."""
    return await TopicService.get_topic(db, current_user, topic_id)


@router.put("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: str,
    data: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a topic."""
    return await TopicService.update_topic(db, current_user, topic_id, data)


@router.delete("/{topic_id}")
async def delete_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a topic and all associated revisions."""
    return await TopicService.delete_topic(db, current_user, topic_id)
