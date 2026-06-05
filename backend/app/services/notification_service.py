"""Notification service."""

from datetime import datetime, date, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.notification import Notification
from app.models.revision import Revision
from app.models.topic import Topic
from app.models.user import User


class NotificationService:
    """Service for managing user notifications."""

    @staticmethod
    async def get_notifications(
        db: AsyncSession, user: User, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]:
        """Get user notifications."""
        query = select(Notification).where(Notification.user_id == user.id)
        if unread_only:
            query = query.where(Notification.read == False)
        query = query.order_by(Notification.created_at.desc()).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def mark_read(db: AsyncSession, user: User, notification_id: str) -> None:
        """Mark a single notification as read."""
        await db.execute(
            update(Notification)
            .where(
                Notification.id == notification_id,
                Notification.user_id == user.id,
            )
            .values(read=True)
        )

    @staticmethod
    async def mark_all_read(db: AsyncSession, user: User) -> None:
        """Mark all notifications as read."""
        await db.execute(
            update(Notification)
            .where(Notification.user_id == user.id, Notification.read == False)
            .values(read=True)
        )

    @staticmethod
    async def get_unread_count(db: AsyncSession, user: User) -> int:
        """Get count of unread notifications."""
        result = await db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user.id,
                Notification.read == False,
            )
        )
        return result.scalar() or 0

    @staticmethod
    async def generate_revision_reminders(db: AsyncSession) -> int:
        """Generate reminder notifications for today's revisions. Called by scheduler."""
        today = date.today()

        # Get all pending revisions for today, grouped by user
        result = await db.execute(
            select(Revision.user_id, func.count(Revision.id).label("count"))
            .where(
                Revision.scheduled_date == today,
                Revision.status == "pending",
            )
            .group_by(Revision.user_id)
        )

        count = 0
        for row in result:
            user_id = row.user_id
            rev_count = row.count

            notification = Notification(
                user_id=user_id,
                title=f"📚 {rev_count} revision{'s' if rev_count > 1 else ''} due today!",
                message=f"You have {rev_count} topic{'s' if rev_count > 1 else ''} to revise today. Start your recall session now!",
                type="revision_reminder",
            )
            db.add(notification)
            count += 1

        if count > 0:
            await db.flush()
        return count
