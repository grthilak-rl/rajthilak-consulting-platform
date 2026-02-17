from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NoteCreate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id: UUID
    requirement_id: UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
