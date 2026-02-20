from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.case_study import CaseStudy
from app.models.requirement import Requirement
from app.models.service import Service
from app.models.site_content import SiteContent
from app.models.testimonial import Testimonial
from app.schemas.case_study import CaseStudyResponse
from app.schemas.requirement import RequirementCreate, RequirementResponse
from app.schemas.service import ServiceResponse
from app.schemas.site_content import SiteContentResponse
from app.schemas.testimonial import TestimonialResponse

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


@router.get("/case-studies", response_model=list[CaseStudyResponse])
def list_case_studies(db: Session = Depends(get_db)):
    studies = (
        db.query(CaseStudy)
        .filter(CaseStudy.is_active == True)
        .order_by(CaseStudy.display_order, CaseStudy.created_at.desc())
        .all()
    )
    return [CaseStudyResponse.from_orm_model(s) for s in studies]


@router.get("/case-studies/{slug}", response_model=CaseStudyResponse)
def get_case_study(slug: str, db: Session = Depends(get_db)):
    study = (
        db.query(CaseStudy)
        .filter(CaseStudy.slug == slug, CaseStudy.is_active == True)
        .first()
    )
    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case study not found",
        )
    return CaseStudyResponse.from_orm_model(study)


@router.get("/services", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    services = (
        db.query(Service)
        .filter(Service.is_active == True)
        .order_by(Service.display_order, Service.created_at.desc())
        .all()
    )
    return services


@router.get("/services/{slug}", response_model=ServiceResponse)
def get_service(slug: str, db: Session = Depends(get_db)):
    service = (
        db.query(Service)
        .filter(Service.slug == slug, Service.is_active == True)
        .first()
    )
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    return service


@router.get("/testimonials", response_model=list[TestimonialResponse])
def list_testimonials(db: Session = Depends(get_db)):
    testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .order_by(Testimonial.created_at.desc())
        .all()
    )
    return testimonials


@router.get("/site-content", response_model=list[SiteContentResponse])
def list_site_content(key: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SiteContent)
    if key:
        query = query.filter(SiteContent.key == key)
    return [SiteContentResponse.from_orm_model(c) for c in query.all()]
