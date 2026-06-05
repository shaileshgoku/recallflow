"""Recall session model."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RecallSession(Base):
    """Active recall session record."""
    __tablename__ = "recall_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    topic_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    revision_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("revisions.id", ondelete="SET NULL"), nullable=True
    )
    recall_rating: Mapped[str] = mapped_column(
        String(20), nullable=False  # easy, medium, hard, forgot
    )
    user_answer: Mapped[str] = mapped_column(Text, nullable=True)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    topic = relationship("Topic", back_populates="recall_sessions")
    user = relationship("User", back_populates="recall_sessions")
    revision = relationship("Revision", back_populates="recall_sessions")
