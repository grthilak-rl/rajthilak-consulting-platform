from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TestimonialResponse(BaseModel):
    id: UUID
    author_name: str
    author_role: str
    author_company: str
    author_initials: str
    content: str
    rating: int
    featured: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClientTestimonialCreate(BaseModel):
    content: str
    rating: int = Field(ge=1, le=5)
    author_role: Optional[str] = None
