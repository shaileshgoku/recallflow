"""Revision model."""

import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Revision(Base):
    """Scheduled revision entry model."""
    __tablename__ = "revisions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    topic_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    completed_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"  # pending, completed, missed
    )
    revision_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-6
    day_interval: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 3, 7, 14, 30, 90
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    topic = relationship("Topic", back_populates="revisions")
    user = relationship("User", back_populates="revisions")
    recall_sessions = relationship("RecallSession", back_populates="revision")
