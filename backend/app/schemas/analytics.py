"""Analytics schemas."""

from pydantic import BaseModel
from datetime import date


class OverviewStats(BaseModel):
    """Dashboard overview statistics."""
    total_topics: int
    topics_mastered: int
    total_revisions: int
    revisions_completed: int
    revisions_pending_today: int
    average_memory_strength: float
    current_streak: int
    longest_streak: int
    total_recall_sessions: int
    recall_accuracy: float


class RetentionData(BaseModel):
    """Retention curve data point."""
    day: int
    retention_percentage: float


class HeatmapDay(BaseModel):
    """Activity heatmap day."""
    date: date
    count: int
    level: int  # 0-4 intensity


class CategoryBreakdown(BaseModel):
    """Per-category analytics."""
    category_name: str
    category_color: str
    topic_count: int
    avg_memory_strength: float
    completion_rate: float


class DailyAccuracy(BaseModel):
    """Daily recall accuracy data point."""
    date: date
    accuracy: float
    total_sessions: int


class AnalyticsResponse(BaseModel):
    """Full analytics response."""
    overview: OverviewStats
    retention_curve: list[RetentionData]
    heatmap: list[HeatmapDay]
    category_breakdown: list[CategoryBreakdown]
    daily_accuracy: list[DailyAccuracy]
    difficulty_distribution: dict[str, int]
    weak_topics: list[dict]
    upcoming_revisions: list[dict]
