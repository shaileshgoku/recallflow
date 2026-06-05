"""Active recall service."""

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.recall_session import RecallSession
from app.models.topic import Topic
from app.models.revision import Revision
from app.models.user import User
from app.services.revision_engine import RevisionEngine


class RecallService:
    """Service for active recall session operations."""

    @staticmethod
    async def start_session(
        db: AsyncSession, user: User, topic_id: str, revision_id: str = None
    ) -> RecallSession:
        """Start a new recall session."""
        # Verify topic belongs to user
        result = await db.execute(
            select(Topic).where(Topic.id == topic_id, Topic.user_id == user.id)
        )
        topic = result.scalar_one_or_none()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found"
            )

        session = RecallSession(
            topic_id=topic_id,
            user_id=user.id,
            revision_id=revision_id,
            recall_rating="",  # Will be updated on submit
            started_at=datetime.now(timezone.utc),
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)

        return session

    @staticmethod
    async def submit_session(
        db: AsyncSession,
        user: User,
        session_id: str,
        user_answer: str,
        recall_rating: str,
        time_spent_seconds: int,
    ) -> RecallSession:
        """Submit a recall session answer and rating."""
        result = await db.execute(
            select(RecallSession).where(
                RecallSession.id == session_id,
                RecallSession.user_id == user.id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )

        session.user_answer = user_answer
        session.recall_rating = recall_rating
        session.time_spent_seconds = time_spent_seconds
        session.completed_at = datetime.now(timezone.utc)

        # If linked to a revision, complete it
        if session.revision_id:
            rev_result = await db.execute(
                select(Revision).where(Revision.id == session.revision_id)
            )
            revision = rev_result.scalar_one_or_none()
            if revision and revision.status == "pending":
                await RevisionEngine.complete_revision(db, revision, recall_rating)
        else:
            # Update topic stats even without revision
            topic_result = await db.execute(
                select(Topic).where(Topic.id == session.topic_id)
            )
            topic = topic_result.scalar_one_or_none()
            if topic:
                topic.total_recalls += 1
                if recall_rating in ("easy", "medium"):
                    topic.successful_recalls += 1
                if topic.total_recalls > 0:
                    topic.memory_strength = min(
                        100.0,
                        (topic.successful_recalls / topic.total_recalls) * 100
                    )
                if topic.memory_strength >= 85 and topic.total_recalls >= 4:
                    topic.mastered = True

        await db.flush()
        await db.refresh(session)
        return session

    @staticmethod
    async def get_history(
        db: AsyncSession, user: User, topic_id: str = None, limit: int = 50
    ) -> dict:
        """Get recall session history."""
        query = select(RecallSession).where(RecallSession.user_id == user.id)
        if topic_id:
            query = query.where(RecallSession.topic_id == topic_id)
        query = query.order_by(RecallSession.started_at.desc()).limit(limit)

        result = await db.execute(query)
        sessions = result.scalars().all()

        # Calculate stats
        total = len(sessions)
        if total > 0:
            total_time = sum(s.time_spent_seconds for s in sessions)
            avg_time = total_time / total
            successful = sum(1 for s in sessions if s.recall_rating in ("easy", "medium"))
            accuracy = (successful / total) * 100
        else:
            avg_time = 0
            accuracy = 0

        return {
            "sessions": sessions,
            "total": total,
            "average_time_seconds": avg_time,
            "accuracy_rate": accuracy,
        }
