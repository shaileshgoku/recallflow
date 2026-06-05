"""Notification routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.notification_service import NotificationService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user notifications."""
    notifications = await NotificationService.get_notifications(
        db, current_user, unread_only, limit
    )
    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "read": n.read,
                "created_at": n.created_at,
            }
            for n in notifications
        ],
        "unread_count": await NotificationService.get_unread_count(db, current_user),
    }


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    await NotificationService.mark_read(db, current_user, notification_id)
    return {"message": "Notification marked as read"}


@router.post("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    await NotificationService.mark_all_read(db, current_user)
    return {"message": "All notifications marked as read"}
