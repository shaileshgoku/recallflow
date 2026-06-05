"""Topic management service."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import Optional
from app.models.topic import Topic
from app.models.category import Category
from app.models.user import User
from app.schemas.topic import TopicCreate, TopicUpdate, TopicResponse, TopicListResponse
from app.services.revision_engine import RevisionEngine


class TopicService:
    """Service for topic CRUD operations."""

    @staticmethod
    async def create_topic(db: AsyncSession, user: User, data: TopicCreate) -> TopicResponse:
        """Create a new topic and auto-generate revision schedule."""
        # Handle category
        category_id = data.category_id
        if data.category_name and not category_id:
            # Auto-create category
            result = await db.execute(
                select(Category).where(
                    Category.name == data.category_name,
                    Category.user_id == user.id,
                )
            )
            category = result.scalar_one_or_none()
            if not category:
                category = Category(name=data.category_name, user_id=user.id)
                db.add(category)
                await db.flush()
            category_id = category.id

        topic = Topic(
            user_id=user.id,
            title=data.title,
            notes=data.notes,
            difficulty=data.difficulty,
            tags=data.tags,
            category_id=category_id,
        )
        db.add(topic)
        await db.flush()
        await db.refresh(topic)

        # Auto-generate revision schedule
        await RevisionEngine.create_revision_schedule(db, topic, user)

        # Reload with category relationship
        result = await db.execute(
            select(Topic).options(selectinload(Topic.category)).where(Topic.id == topic.id)
        )
        topic = result.scalar_one()

        return TopicResponse.model_validate(topic)

    @staticmethod
    async def get_topics(
        db: AsyncSession,
        user: User,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        difficulty: Optional[str] = None,
        category_id: Optional[str] = None,
        mastered: Optional[bool] = None,
    ) -> TopicListResponse:
        """Get paginated topics with filters."""
        query = (
            select(Topic)
            .options(selectinload(Topic.category))
            .where(Topic.user_id == user.id)
        )

        if search:
            query = query.where(
                or_(
                    Topic.title.ilike(f"%{search}%"),
                    Topic.notes.ilike(f"%{search}%"),
                )
            )
        if difficulty:
            query = query.where(Topic.difficulty == difficulty)
        if category_id:
            query = query.where(Topic.category_id == category_id)
        if mastered is not None:
            query = query.where(Topic.mastered == mastered)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        # Paginate
        query = query.order_by(Topic.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await db.execute(query)
        topics = result.scalars().all()

        return TopicListResponse(
            topics=[TopicResponse.model_validate(t) for t in topics],
            total=total,
            page=page,
            per_page=per_page,
        )

    @staticmethod
    async def get_topic(db: AsyncSession, user: User, topic_id: str) -> TopicResponse:
        """Get a single topic."""
        result = await db.execute(
            select(Topic)
            .options(selectinload(Topic.category))
            .where(Topic.id == topic_id, Topic.user_id == user.id)
        )
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        return TopicResponse.model_validate(topic)

    @staticmethod
    async def update_topic(
        db: AsyncSession, user: User, topic_id: str, data: TopicUpdate
    ) -> TopicResponse:
        """Update a topic."""
        result = await db.execute(
            select(Topic)
            .options(selectinload(Topic.category))
            .where(Topic.id == topic_id, Topic.user_id == user.id)
        )
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(topic, key, value)

        await db.flush()
        await db.refresh(topic)
        return TopicResponse.model_validate(topic)

    @staticmethod
    async def delete_topic(db: AsyncSession, user: User, topic_id: str) -> dict:
        """Delete a topic and all associated data."""
        result = await db.execute(
            select(Topic).where(Topic.id == topic_id, Topic.user_id == user.id)
        )
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

        await db.delete(topic)
        return {"message": "Topic deleted successfully"}

    @staticmethod
    async def get_categories(db: AsyncSession, user: User) -> list:
        """Get all categories for a user."""
        result = await db.execute(
            select(Category).where(Category.user_id == user.id).order_by(Category.name)
        )
        return result.scalars().all()
