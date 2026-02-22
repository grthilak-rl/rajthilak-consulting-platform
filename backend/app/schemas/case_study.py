from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TechnologyItem(BaseModel):
    name: str
    category: str


class MetricItem(BaseModel):
    value: str
    label: str


class VisualConfig(BaseModel):
    color: str
    icon: str


class GalleryItem(BaseModel):
    url: str
    caption: str
    type: str


class CaseStudyResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    role: str
    description: str
    industry: str
    technologies: list[TechnologyItem]
    featured: bool
    metrics: Optional[list[MetricItem]] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    role_description: Optional[str] = None
    key_features: Optional[list[str]] = None
    architecture: Optional[str] = None
    challenges: Optional[str] = None
    impact: Optional[str] = None
    gallery: Optional[list[GalleryItem]] = None
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
            problem=obj.problem,
            solution=obj.solution,
            role_description=obj.role_description,
            key_features=obj.key_features,
            architecture=obj.architecture,
            challenges=obj.challenges,
            impact=obj.impact,
            gallery=obj.gallery,
            visual=VisualConfig(color=obj.visual_color, icon=obj.visual_icon),
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


class CaseStudyAdminResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    role: str
    description: str
    industry: str
    technologies: list[TechnologyItem]
    featured: bool
    metrics: Optional[list[MetricItem]] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    role_description: Optional[str] = None
    key_features: Optional[list[str]] = None
    architecture: Optional[str] = None
    challenges: Optional[str] = None
    impact: Optional[str] = None
    gallery: Optional[list[GalleryItem]] = None
    visual: VisualConfig
    display_order: int
    is_active: bool
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
            problem=obj.problem,
            solution=obj.solution,
            role_description=obj.role_description,
            key_features=obj.key_features,
            architecture=obj.architecture,
            challenges=obj.challenges,
            impact=obj.impact,
            gallery=obj.gallery,
            visual=VisualConfig(color=obj.visual_color, icon=obj.visual_icon),
            display_order=obj.display_order,
            is_active=obj.is_active,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


class CaseStudyCreate(BaseModel):
    slug: str
    title: str
    role: str
    description: str
    industry: str
    technologies: list[TechnologyItem] = []
    featured: bool = False
    metrics: Optional[list[MetricItem]] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    role_description: Optional[str] = None
    key_features: Optional[list[str]] = None
    architecture: Optional[str] = None
    challenges: Optional[str] = None
    impact: Optional[str] = None
    gallery: Optional[list[GalleryItem]] = None
    visual_color: str = "primary"
    visual_icon: str = "code"
    display_order: int = 0
    is_active: bool = True


class CaseStudyUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    technologies: Optional[list[TechnologyItem]] = None
    featured: Optional[bool] = None
    metrics: Optional[list[MetricItem]] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    role_description: Optional[str] = None
    key_features: Optional[list[str]] = None
    architecture: Optional[str] = None
    challenges: Optional[str] = None
    impact: Optional[str] = None
    gallery: Optional[list[GalleryItem]] = None
    visual_color: Optional[str] = None
    visual_icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
