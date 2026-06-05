"""Background task scheduler using APScheduler."""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import async_session
from app.services.revision_engine import RevisionEngine
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def check_missed_revisions():
    """Daily task: mark missed revisions and reschedule them."""
    try:
        async with async_session() as db:
            count = await RevisionEngine.mark_missed_revisions(db)
            await db.commit()
            if count > 0:
                logger.info(f"Marked {count} revisions as missed and rescheduled")
    except Exception as e:
        logger.error(f"Error checking missed revisions: {e}")


async def generate_daily_reminders():
    """Daily task: generate reminder notifications for today's revisions."""
    try:
        async with async_session() as db:
            count = await NotificationService.generate_revision_reminders(db)
            await db.commit()
            if count > 0:
                logger.info(f"Generated {count} revision reminder notifications")
    except Exception as e:
        logger.error(f"Error generating reminders: {e}")


def start_scheduler():
    """Initialize and start the background scheduler."""
    # Check missed revisions daily at midnight
    scheduler.add_job(
        check_missed_revisions,
        "cron",
        hour=0,
        minute=5,
        id="check_missed_revisions",
        replace_existing=True,
    )

    # Generate daily reminders at 8 AM
    scheduler.add_job(
        generate_daily_reminders,
        "cron",
        hour=8,
        minute=0,
        id="generate_daily_reminders",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Background scheduler started")


def stop_scheduler():
    """Stop the background scheduler."""
    scheduler.shutdown()
    logger.info("Background scheduler stopped")
