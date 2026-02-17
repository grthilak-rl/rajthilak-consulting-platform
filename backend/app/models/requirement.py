import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class RequirementType(str, enum.Enum):
    full_time = "full_time"
    contract = "contract"
    one_off = "one_off"


class RequirementStatus(str, enum.Enum):
    new = "new"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(Enum(RequirementType), nullable=False)
    tech_stack = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    status = Column(
        Enum(RequirementStatus), default=RequirementStatus.new, nullable=False
    )
    progress = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    notes = relationship("Note", back_populates="requirement")
