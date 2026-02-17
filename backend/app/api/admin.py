from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.note import Note
from app.models.requirement import Requirement
from app.schemas.note import NoteCreate, NoteResponse
from app.schemas.requirement import (
    ProgressUpdate,
    RequirementResponse,
    StatusUpdate,
)

router = APIRouter()


@router.get("/requirements", response_model=list[RequirementResponse])
def list_requirements(db: Session = Depends(get_db)):
    requirements = (
        db.query(Requirement).order_by(Requirement.created_at.desc()).all()
    )
    return requirements


@router.get("/requirements/{requirement_id}", response_model=RequirementResponse)
def get_requirement(requirement_id: UUID, db: Session = Depends(get_db)):
    requirement = (
        db.query(Requirement).filter(Requirement.id == requirement_id).first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    return requirement


@router.patch(
    "/requirements/{requirement_id}/status",
    response_model=RequirementResponse,
)
def update_status(
    requirement_id: UUID,
    body: StatusUpdate,
    db: Session = Depends(get_db),
):
    requirement = (
        db.query(Requirement).filter(Requirement.id == requirement_id).first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    requirement.status = body.status
    db.commit()
    db.refresh(requirement)
    return requirement


@router.patch(
    "/requirements/{requirement_id}/progress",
    response_model=RequirementResponse,
)
def update_progress(
    requirement_id: UUID,
    body: ProgressUpdate,
    db: Session = Depends(get_db),
):
    requirement = (
        db.query(Requirement).filter(Requirement.id == requirement_id).first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    requirement.progress = body.progress
    db.commit()
    db.refresh(requirement)
    return requirement


@router.post(
    "/requirements/{requirement_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    requirement_id: UUID,
    body: NoteCreate,
    db: Session = Depends(get_db),
):
    requirement = (
        db.query(Requirement).filter(Requirement.id == requirement_id).first()
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found",
        )
    note = Note(requirement_id=requirement_id, content=body.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get(
    "/requirements/{requirement_id}/notes",
    response_model=list[NoteResponse],
)
def list_notes(requirement_id: UUID, db: Session = Depends(get_db)):
    requirement = (
        db.query(Requirement).filter(Requirement.id == requirement_id).first()
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
