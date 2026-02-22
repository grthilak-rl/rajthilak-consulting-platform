import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.core.database import Base


class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    industry = Column(String, nullable=False)
    technologies = Column(JSON, nullable=False, default=list)
    featured = Column(Boolean, default=False, nullable=False)
    metrics = Column(JSON, nullable=True)  # [{"value": "60%", "label": "Faster"}]
    problem = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    role_description = Column(Text, nullable=True)
    key_features = Column(JSON, nullable=True)  # ["feature1", "feature2"]
    architecture = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    gallery = Column(JSON, nullable=True)  # [{"url": "", "caption": "", "type": ""}]
    visual_color = Column(String, nullable=False, default="primary")
    visual_icon = Column(String, nullable=False, default="code")
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
