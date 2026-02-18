from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementResponse

router = APIRouter()


@router.post(
    "/requirements",
    response_model=RequirementResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
def create_requirement(request: Request, body: RequirementCreate, db: Session = Depends(get_db)):
    requirement = Requirement(
        name=body.name,
        email=body.email,
        company=body.company,
        title=body.title,
        description=body.description,
        type=body.type,
        tech_stack=body.tech_stack,
        timeline=body.timeline,
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement
