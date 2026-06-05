"""Revision schemas."""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class RevisionResponse(BaseModel):
    """Schema for revision response."""
    id: str
    topic_id: str
    topic_title: Optional[str] = None
    topic_category: Optional[str] = None
    topic_difficulty: Optional[str] = None
    scheduled_date: date
    completed_date: Optional[datetime] = None
    status: str
    revision_number: int
    day_interval: int
    created_at: datetime

    class Config:
        from_attributes = True


class RevisionComplete(BaseModel):
    """Schema for completing a revision."""
    recall_rating: Optional[str] = None  # easy, medium, hard, forgot


class RevisionCalendarDay(BaseModel):
    """Schema for a single day in the revision calendar."""
    date: date
    total: int
    completed: int
    pending: int
    missed: int


class RevisionCalendarResponse(BaseModel):
    """Schema for revision calendar."""
    days: list[RevisionCalendarDay]


class RevisionStatsResponse(BaseModel):
    """Schema for revision statistics."""
    total_revisions: int
    completed: int
    pending: int
    missed: int
    completion_rate: float
    current_streak: int
    longest_streak: int
    today_count: int
    today_completed: int
