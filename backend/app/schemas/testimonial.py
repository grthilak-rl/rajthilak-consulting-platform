from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


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
