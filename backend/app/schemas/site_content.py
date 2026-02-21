from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SiteContentCreate(BaseModel):
    key: str
    title: Optional[str] = None
    content: str
    metadata: Optional[dict] = None


class SiteContentUpdate(BaseModel):
    key: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[dict] = None


class SiteContentResponse(BaseModel):
    id: UUID
    key: str
    title: Optional[str] = None
    content: str
    metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, obj):
        return cls(
            id=obj.id,
            key=obj.key,
            title=obj.title,
            content=obj.content,
            metadata=obj.metadata_,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )
