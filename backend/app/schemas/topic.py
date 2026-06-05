"""Topic schemas."""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryCreate(BaseModel):
    """Schema for creating a category."""
    name: str
    color: str = "#00f5ff"
    icon: Optional[str] = None


class CategoryResponse(BaseModel):
    """Schema for category response."""
    id: str
    name: str
    color: str
    icon: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TopicCreate(BaseModel):
    """Schema for creating a topic."""
    title: str
    notes: Optional[str] = None
    difficulty: str = "medium"  # easy, medium, hard
    tags: list[str] = []
    category_id: Optional[str] = None
    category_name: Optional[str] = None  # Auto-create category if not exists


class TopicUpdate(BaseModel):
    """Schema for updating a topic."""
    title: Optional[str] = None
    notes: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[list[str]] = None
    category_id: Optional[str] = None


class TopicResponse(BaseModel):
    """Schema for topic response."""
    id: str
    title: str
    notes: Optional[str] = None
    difficulty: str
    tags: list = []
    memory_strength: float
    mastered: bool
    total_recalls: int
    successful_recalls: int
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicListResponse(BaseModel):
    """Schema for paginated topic list."""
    topics: list[TopicResponse]
    total: int
    page: int
    per_page: int
