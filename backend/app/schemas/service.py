from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ServiceResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str
    icon: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
