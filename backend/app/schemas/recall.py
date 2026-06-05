"""Recall session schemas."""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RecallStart(BaseModel):
    """Schema for starting a recall session."""
    topic_id: str
    revision_id: Optional[str] = None


class RecallSubmit(BaseModel):
    """Schema for submitting a recall answer."""
    session_id: str
    user_answer: str
    recall_rating: str  # easy, medium, hard, forgot
    time_spent_seconds: int


class RecallSessionResponse(BaseModel):
    """Schema for recall session response."""
    id: str
    topic_id: str
    topic_title: Optional[str] = None
    recall_rating: str
    user_answer: Optional[str] = None
    time_spent_seconds: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecallHistoryResponse(BaseModel):
    """Schema for recall history."""
    sessions: list[RecallSessionResponse]
    total: int
    average_time_seconds: float
    accuracy_rate: float  # Percentage of easy+medium ratings
