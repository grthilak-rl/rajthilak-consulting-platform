from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MetricItem(BaseModel):
    value: str
    label: str


class VisualConfig(BaseModel):
    color: str
    icon: str


class CaseStudyResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    role: str
    description: str
    industry: str
    technologies: list[str]
    featured: bool
    metrics: Optional[list[MetricItem]] = None
    visual: VisualConfig
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, obj):
        return cls(
            id=obj.id,
            slug=obj.slug,
            title=obj.title,
            role=obj.role,
            description=obj.description,
            industry=obj.industry,
            technologies=obj.technologies or [],
            featured=obj.featured,
            metrics=obj.metrics,
            visual=VisualConfig(color=obj.visual_color, icon=obj.visual_icon),
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )
