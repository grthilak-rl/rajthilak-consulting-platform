from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import CurrentUser, require_client
from app.models.note import Note
from app.models.requirement import Requirement, RequirementStatus
from app.models.testimonial import Testimonial
from app.models.user import User
from app.schemas.note import NoteResponse
from app.schemas.requirement import RequirementResponse
from app.schemas.testimonial import ClientTestimonialCreate, TestimonialResponse

router = APIRouter()


def _get_client_user(user: CurrentUser, db: Session) -> User:
    """Look up the User row for the current client, converting the JWT string id to UUID."""
    client_user = db.query(User).filter(User.id == UUID(user.id)).first()
    if not client_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return client_user


@router.get("/requirements", response_model=list[RequirementResponse])
def list_my_requirements(
    user: CurrentUser = Depends(require_client),
    db: Session = Depends(get_db),
):
    """Client sees only requirements matching their email."""
    client_user = _get_client_user(user, db)
    requirements = (
        db.query(Requirement)
        .filter(Requirement.email == client_user.email)
        .order_by(Requirement.created_at.desc())
        .all()
    )
    return requirements


@router.get("/requirements/{requirement_id}", response_model=RequirementResponse)
def get_my_requirement(
    requirement_id: UUID,
    user: CurrentUser = Depends(require_client),
    db: Session = Depends(get_db),
):
    client_user = _get_client_user(user, db)
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.email == client_user.email,
        )
        .first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    return requirement


@router.get("/requirements/{requirement_id}/notes", response_model=list[NoteResponse])
def list_my_notes(
    requirement_id: UUID,
    user: CurrentUser = Depends(require_client),
    db: Session = Depends(get_db),
):
    """Client can see notes on their own requirements."""
    client_user = _get_client_user(user, db)
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.email == client_user.email,
        )
        .first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    notes = (
        db.query(Note)
        .filter(Note.requirement_id == requirement_id)
        .order_by(Note.created_at.desc())
        .all()
    )
    return notes


@router.post(
    "/requirements/{requirement_id}/testimonial",
    response_model=TestimonialResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_testimonial(
    requirement_id: UUID,
    body: ClientTestimonialCreate,
    user: CurrentUser = Depends(require_client),
    db: Session = Depends(get_db),
):
    """Client can submit a testimonial once their project is completed."""
    client_user = _get_client_user(user, db)
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.email == client_user.email,
        )
        .first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )

    if requirement.status != RequirementStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project must be completed to submit feedback",
        )

    name_parts = requirement.name.strip().split()
    initials = "".join(p[0].upper() for p in name_parts[:2]) if name_parts else "??"

    testimonial = Testimonial(
        author_name=requirement.name,
        author_role=body.author_role or "Client",
        author_company=requirement.company or "Independent",
        author_initials=initials,
        content=body.content,
        rating=body.rating,
        is_active=False,
        featured=False,
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial
