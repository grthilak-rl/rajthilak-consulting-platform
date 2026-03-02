import os
import secrets
import uuid as uuid_mod
from pathlib import Path
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import ALLOWED_EXTENSIONS, FRONTEND_URL, MAX_UPLOAD_SIZE, UPLOAD_DIR
from app.core.database import get_db
from app.core.deps import CurrentUser, require_admin, require_admin_or_editor
from app.models.case_study import CaseStudy
from app.models.note import Note
from app.models.requirement import Requirement, RequirementStatus
from app.models.site_content import SiteContent
from app.models.user import User, UserRole
from app.schemas.case_study import (
    CaseStudyAdminResponse,
    CaseStudyCreate,
    CaseStudyUpdate,
)
from app.schemas.note import NoteCreate, NoteResponse
from app.schemas.requirement import (
    ProgressUpdate,
    RequirementResponse,
    RequirementStatusResponse,
    StatusUpdate,
)
from app.schemas.site_content import (
    SiteContentCreate,
    SiteContentResponse,
    SiteContentUpdate,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────


def _create_client_invitation(requirement: Requirement, db: Session) -> Optional[str]:
    """Create a client user with an invite token when a requirement is accepted."""
    existing_user = db.query(User).filter(User.email == requirement.email).first()

    if existing_user and existing_user.password_hash:
        return None

    if existing_user and existing_user.invite_token:
        return f"{FRONTEND_URL}/invite/{existing_user.invite_token}"

    token = secrets.token_urlsafe(32)
    client_user = User(
        email=requirement.email,
        role=UserRole.client,
        invite_token=token,
        password_hash=None,
    )
    db.add(client_user)
    db.flush()
    return f"{FRONTEND_URL}/invite/{token}"


# ── Requirements (admin only) ───────────────────────────────


@router.get("/requirements", response_model=list[RequirementResponse])
def list_requirements(
    user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db),
):
    requirements = (
        db.query(Requirement).order_by(Requirement.created_at.desc()).all()
    )
    return requirements


@router.get("/requirements/{requirement_id}", response_model=RequirementStatusResponse)
def get_requirement(
    requirement_id: UUID,
    user: CurrentUser = Depends(require_admin),
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

    invite_link = None
    if requirement.status == RequirementStatus.accepted:
        client_user = db.query(User).filter(User.email == requirement.email).first()
        if client_user and client_user.invite_token:
            invite_link = f"{FRONTEND_URL}/invite/{client_user.invite_token}"

    response_data = RequirementResponse.model_validate(requirement).model_dump()
    return RequirementStatusResponse(**response_data, invite_link=invite_link)


@router.patch(
    "/requirements/{requirement_id}/status",
    response_model=RequirementStatusResponse,
)
def update_status(
    requirement_id: UUID,
    body: StatusUpdate,
    user: CurrentUser = Depends(require_admin),
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

    invite_link = None
    if body.status == RequirementStatus.accepted:
        invite_link = _create_client_invitation(requirement, db)

    db.commit()
    db.refresh(requirement)

    response_data = RequirementResponse.model_validate(requirement).model_dump()
    return RequirementStatusResponse(**response_data, invite_link=invite_link)


@router.patch(
    "/requirements/{requirement_id}/progress",
    response_model=RequirementResponse,
)
def update_progress(
    requirement_id: UUID,
    body: ProgressUpdate,
    user: CurrentUser = Depends(require_admin),
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
    user: CurrentUser = Depends(require_admin),
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
def list_notes(
    requirement_id: UUID,
    user: CurrentUser = Depends(require_admin),
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
    notes = (
        db.query(Note)
        .filter(Note.requirement_id == requirement_id)
        .order_by(Note.created_at.desc())
        .all()
    )
    return notes


# ── File Uploads (admin or editor) ──────────────────────────


@router.post("/uploads")
async def upload_file(
    file: UploadFile,
    user: CurrentUser = Depends(require_admin_or_editor),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
        )
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_name = Path(file.filename or "upload").name.replace(" ", "_")
    unique_name = f"{uuid_mod.uuid4().hex[:12]}_{safe_name}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)
    return {"url": f"/uploads/{unique_name}"}


# ── Case Studies (admin or editor) ──────────────────────────


@router.get("/case-studies", response_model=list[CaseStudyAdminResponse])
def list_case_studies_admin(
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    studies = (
        db.query(CaseStudy)
        .order_by(CaseStudy.display_order, CaseStudy.created_at.desc())
        .all()
    )
    return [CaseStudyAdminResponse.from_orm_model(s) for s in studies]


@router.get("/case-studies/{case_study_id}", response_model=CaseStudyAdminResponse)
def get_case_study_admin(
    case_study_id: UUID,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )
    return CaseStudyAdminResponse.from_orm_model(study)


@router.post(
    "/case-studies",
    response_model=CaseStudyAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_case_study(
    body: CaseStudyCreate,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    existing = db.query(CaseStudy).filter(CaseStudy.slug == body.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slug '{body.slug}' already exists",
        )
    study = CaseStudy(
        slug=body.slug,
        title=body.title,
        role=body.role,
        description=body.description,
        industry=body.industry,
        technologies=[t.model_dump() for t in body.technologies],
        featured=body.featured,
        metrics=[m.model_dump() for m in body.metrics] if body.metrics else None,
        problem=body.problem,
        solution=body.solution,
        role_description=body.role_description,
        key_features=body.key_features,
        architecture=body.architecture,
        challenges=body.challenges,
        impact=body.impact,
        gallery=[g.model_dump() for g in body.gallery] if body.gallery else None,
        visual_color=body.visual_color,
        visual_icon=body.visual_icon,
        display_order=body.display_order,
        is_active=body.is_active,
    )
    db.add(study)
    db.commit()
    db.refresh(study)
    return CaseStudyAdminResponse.from_orm_model(study)


@router.patch("/case-studies/{case_study_id}", response_model=CaseStudyAdminResponse)
def update_case_study(
    case_study_id: UUID,
    body: CaseStudyUpdate,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )
    update_data = body.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != study.slug:
        existing = (
            db.query(CaseStudy).filter(CaseStudy.slug == update_data["slug"]).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slug '{update_data['slug']}' already exists",
            )
    if "technologies" in update_data and update_data["technologies"] is not None:
        update_data["technologies"] = [
            t.model_dump() if hasattr(t, "model_dump") else t
            for t in update_data["technologies"]
        ]
    if "metrics" in update_data and update_data["metrics"] is not None:
        update_data["metrics"] = [
            m.model_dump() if hasattr(m, "model_dump") else m
            for m in update_data["metrics"]
        ]
    if "gallery" in update_data and update_data["gallery"] is not None:
        update_data["gallery"] = [
            g.model_dump() if hasattr(g, "model_dump") else g
            for g in update_data["gallery"]
        ]
    for field, value in update_data.items():
        setattr(study, field, value)
    db.commit()
    db.refresh(study)
    return CaseStudyAdminResponse.from_orm_model(study)


@router.delete(
    "/case-studies/{case_study_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_case_study(
    case_study_id: UUID,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )
    study.is_active = False
    db.commit()


# ── Site Content (admin or editor) ──────────────────────────


@router.get("/site-content", response_model=list[SiteContentResponse])
def list_site_content(
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    items = db.query(SiteContent).order_by(SiteContent.key).all()
    return [SiteContentResponse.from_orm_model(i) for i in items]


@router.post(
    "/site-content",
    response_model=SiteContentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site_content(
    body: SiteContentCreate,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    existing = db.query(SiteContent).filter(SiteContent.key == body.key).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Key '{body.key}' already exists",
        )
    item = SiteContent(
        key=body.key,
        title=body.title,
        content=body.content,
        metadata_=body.metadata,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return SiteContentResponse.from_orm_model(item)


@router.patch("/site-content/{content_id}", response_model=SiteContentResponse)
def update_site_content(
    content_id: UUID,
    body: SiteContentUpdate,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    item = db.query(SiteContent).filter(SiteContent.id == content_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site content not found",
        )
    update_data = body.model_dump(exclude_unset=True)
    if "key" in update_data and update_data["key"] != item.key:
        existing = (
            db.query(SiteContent).filter(SiteContent.key == update_data["key"]).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Key '{update_data['key']}' already exists",
            )
    if "metadata" in update_data:
        update_data["metadata_"] = update_data.pop("metadata")
    for field, value in update_data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return SiteContentResponse.from_orm_model(item)


@router.delete(
    "/site-content/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_site_content(
    content_id: UUID,
    user: CurrentUser = Depends(require_admin_or_editor),
    db: Session = Depends(get_db),
):
    item = db.query(SiteContent).filter(SiteContent.id == content_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site content not found",
        )
    db.delete(item)
    db.commit()
