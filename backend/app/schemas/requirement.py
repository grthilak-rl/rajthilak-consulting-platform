from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.requirement import RequirementStatus, RequirementType


class RequirementCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    title: str
    description: str
    type: RequirementType
    tech_stack: Optional[str] = None
    timeline: Optional[str] = None


class RequirementResponse(BaseModel):
    id: UUID
    name: str
    email: str
    company: Optional[str] = None
    title: str
    description: str
    type: RequirementType
    tech_stack: Optional[str] = None
    timeline: Optional[str] = None
    status: RequirementStatus
    progress: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: RequirementStatus


class ProgressUpdate(BaseModel):
    progress: int
