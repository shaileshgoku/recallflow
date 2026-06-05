"""Topic model."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Float, Boolean, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Topic(Base):
    """Study topic model."""
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(
        String(20), default="medium"  # easy, medium, hard
    )
    tags: Mapped[dict] = mapped_column(JSON, default=list)  # Store as JSON array
    memory_strength: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    mastered: Mapped[bool] = mapped_column(Boolean, default=False)
    total_recalls: Mapped[int] = mapped_column(default=0)
    successful_recalls: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="topics")
    category = relationship("Category", back_populates="topics")
    revisions = relationship("Revision", back_populates="topic", cascade="all, delete-orphan")
    recall_sessions = relationship("RecallSession", back_populates="topic", cascade="all, delete-orphan")
