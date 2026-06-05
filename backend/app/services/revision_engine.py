"""Spaced repetition revision engine — the core scheduling logic."""

from datetime import date, datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.topic import Topic
from app.models.revision import Revision
from app.models.recall_session import RecallSession
from app.models.user import User

# Standard spaced repetition intervals (in days)
REVISION_INTERVALS = [1, 3, 7, 14, 30, 90]

# Multipliers based on recall rating
RATING_MULTIPLIERS = {
    "forgot": 0.3,    # Reschedule much sooner
    "hard": 0.6,      # Reschedule somewhat sooner
    "medium": 1.0,    # Keep standard interval
    "easy": 1.4,      # Extend interval
}


class RevisionEngine:
    """Core spaced repetition engine for scheduling and rescheduling revisions."""

    @staticmethod
    async def create_revision_schedule(
        db: AsyncSession, topic: Topic, user: User
    ) -> list[Revision]:
        """Generate revision schedule when a topic is created."""
        revisions = []
        base_date = date.today()

        for i, interval in enumerate(REVISION_INTERVALS, start=1):
            revision = Revision(
                topic_id=topic.id,
                user_id=user.id,
                scheduled_date=base_date + timedelta(days=interval),
                status="pending",
                revision_number=i,
                day_interval=interval,
            )
            db.add(revision)
            revisions.append(revision)

        await db.flush()
        return revisions

    @staticmethod
    async def get_today_revisions(db: AsyncSession, user: User) -> list[Revision]:
        """Get all revisions due today."""
        today = date.today()
        result = await db.execute(
            select(Revision)
            .where(
                Revision.user_id == user.id,
                Revision.scheduled_date <= today,
                Revision.status == "pending",
            )
            .order_by(Revision.scheduled_date.asc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_upcoming_revisions(
        db: AsyncSession, user: User, days: int = 30
    ) -> list[Revision]:
        """Get upcoming revisions within a number of days."""
        today = date.today()
        end_date = today + timedelta(days=days)
        result = await db.execute(
            select(Revision)
            .where(
                Revision.user_id == user.id,
                Revision.scheduled_date > today,
                Revision.scheduled_date <= end_date,
                Revision.status == "pending",
            )
            .order_by(Revision.scheduled_date.asc())
        )
        return result.scalars().all()

    @staticmethod
    async def complete_revision(
        db: AsyncSession, revision: Revision, recall_rating: str = None
    ) -> Revision:
        """Mark a revision as completed and optionally reschedule based on rating."""
        revision.status = "completed"
        revision.completed_date = datetime.now(timezone.utc)

        # If a recall rating is provided, create adaptive next revision
        if recall_rating and recall_rating in RATING_MULTIPLIERS:
            multiplier = RATING_MULTIPLIERS[recall_rating]

            # Calculate next interval
            current_idx = REVISION_INTERVALS.index(revision.day_interval) if revision.day_interval in REVISION_INTERVALS else -1

            if recall_rating == "forgot":
                # Reset: schedule again in 1 day
                next_interval = 1
                next_number = revision.revision_number
            elif current_idx < len(REVISION_INTERVALS) - 1:
                # Get next standard interval and apply multiplier
                next_standard = REVISION_INTERVALS[current_idx + 1] if current_idx >= 0 else revision.day_interval * 2
                next_interval = max(1, int(next_standard * multiplier))
                next_number = revision.revision_number + 1
            else:
                # Already at max interval, extend further
                next_interval = int(revision.day_interval * multiplier * 1.5)
                next_number = revision.revision_number + 1

            # Create adaptive follow-up revision
            new_revision = Revision(
                topic_id=revision.topic_id,
                user_id=revision.user_id,
                scheduled_date=date.today() + timedelta(days=next_interval),
                status="pending",
                revision_number=next_number,
                day_interval=next_interval,
            )
            db.add(new_revision)

            # Update topic memory strength
            topic_result = await db.execute(
                select(Topic).where(Topic.id == revision.topic_id)
            )
            topic = topic_result.scalar_one_or_none()
            if topic:
                topic.total_recalls += 1
                if recall_rating in ("easy", "medium"):
                    topic.successful_recalls += 1
                # Calculate memory strength
                if topic.total_recalls > 0:
                    topic.memory_strength = min(
                        100.0,
                        (topic.successful_recalls / topic.total_recalls) * 100
                    )
                # Mark as mastered if memory strength is high enough and enough recalls
                if topic.memory_strength >= 85 and topic.total_recalls >= 4:
                    topic.mastered = True

        await db.flush()
        return revision

    @staticmethod
    async def mark_missed_revisions(db: AsyncSession) -> int:
        """Mark all past-due pending revisions as missed. Returns count."""
        yesterday = date.today() - timedelta(days=1)
        result = await db.execute(
            select(Revision).where(
                Revision.scheduled_date < date.today(),
                Revision.status == "pending",
            )
        )
        missed = result.scalars().all()
        count = 0
        for revision in missed:
            revision.status = "missed"
            # Reschedule missed revision for tomorrow
            new_revision = Revision(
                topic_id=revision.topic_id,
                user_id=revision.user_id,
                scheduled_date=date.today() + timedelta(days=1),
                status="pending",
                revision_number=revision.revision_number,
                day_interval=revision.day_interval,
            )
            db.add(new_revision)
            count += 1

        if count > 0:
            await db.flush()
        return count

    @staticmethod
    async def get_revision_calendar(
        db: AsyncSession, user: User, year: int, month: int
    ) -> list[dict]:
        """Get revision data for calendar view."""
        from calendar import monthrange
        _, last_day = monthrange(year, month)
        start_date = date(year, month, 1)
        end_date = date(year, month, last_day)

        result = await db.execute(
            select(
                Revision.scheduled_date,
                Revision.status,
                func.count(Revision.id).label("count"),
            )
            .where(
                Revision.user_id == user.id,
                Revision.scheduled_date >= start_date,
                Revision.scheduled_date <= end_date,
            )
            .group_by(Revision.scheduled_date, Revision.status)
        )

        calendar_data = {}
        for row in result:
            day_str = row.scheduled_date.isoformat()
            if day_str not in calendar_data:
                calendar_data[day_str] = {
                    "date": day_str,
                    "total": 0,
                    "completed": 0,
                    "pending": 0,
                    "missed": 0,
                }
            calendar_data[day_str]["total"] += row.count
            calendar_data[day_str][row.status] += row.count

        return list(calendar_data.values())

    @staticmethod
    async def get_streak(db: AsyncSession, user: User) -> dict:
        """Calculate current and longest revision streak."""
        result = await db.execute(
            select(Revision.completed_date)
            .where(
                Revision.user_id == user.id,
                Revision.status == "completed",
                Revision.completed_date.isnot(None),
            )
            .order_by(Revision.completed_date.desc())
        )

        completed_dates = set()
        for row in result:
            if row.completed_date:
                completed_dates.add(row.completed_date.date())

        if not completed_dates:
            return {"current_streak": 0, "longest_streak": 0}

        sorted_dates = sorted(completed_dates, reverse=True)

        # Current streak
        current_streak = 0
        check_date = date.today()
        for d in sorted_dates:
            if d == check_date or d == check_date - timedelta(days=1):
                current_streak += 1
                check_date = d - timedelta(days=1)
            else:
                break

        # Longest streak
        longest_streak = 1
        current_run = 1
        sorted_asc = sorted(completed_dates)
        for i in range(1, len(sorted_asc)):
            if sorted_asc[i] - sorted_asc[i - 1] == timedelta(days=1):
                current_run += 1
                longest_streak = max(longest_streak, current_run)
            else:
                current_run = 1

        return {"current_streak": current_streak, "longest_streak": longest_streak}

    @staticmethod
    async def get_revision_stats(db: AsyncSession, user: User) -> dict:
        """Get overall revision statistics."""
        today = date.today()

        # Total counts by status
        result = await db.execute(
            select(Revision.status, func.count(Revision.id))
            .where(Revision.user_id == user.id)
            .group_by(Revision.status)
        )
        status_counts = {row[0]: row[1] for row in result}

        total = sum(status_counts.values())
        completed = status_counts.get("completed", 0)
        pending = status_counts.get("pending", 0)
        missed = status_counts.get("missed", 0)

        # Today's revisions
        today_result = await db.execute(
            select(Revision.status, func.count(Revision.id))
            .where(
                Revision.user_id == user.id,
                Revision.scheduled_date == today,
            )
            .group_by(Revision.status)
        )
        today_counts = {row[0]: row[1] for row in today_result}
        today_total = sum(today_counts.values())
        today_completed = today_counts.get("completed", 0)

        # Streaks
        streaks = await RevisionEngine.get_streak(db, user)

        return {
            "total_revisions": total,
            "completed": completed,
            "pending": pending,
            "missed": missed,
            "completion_rate": (completed / total * 100) if total > 0 else 0,
            "current_streak": streaks["current_streak"],
            "longest_streak": streaks["longest_streak"],
            "today_count": today_total,
            "today_completed": today_completed,
        }
