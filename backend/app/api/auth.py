from bcrypt import hashpw, gensalt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import (
    InviteAcceptRequest,
    InviteAcceptResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user.id), user.role.value)
    return LoginResponse(access_token=token, role=user.role.value)


@router.post("/accept-invite", response_model=InviteAcceptResponse)
def accept_invite(body: InviteAcceptRequest, db: Session = Depends(get_db)):
    """Client accepts an invitation by setting their password."""
    user = db.query(User).filter(User.invite_token == body.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invitation",
        )

    if user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already accepted",
        )

    password_hash = hashpw(body.password.encode("utf-8"), gensalt()).decode("utf-8")
    user.password_hash = password_hash
    user.invite_token = None
    db.commit()

    token = create_access_token(str(user.id), user.role.value)
    return InviteAcceptResponse(access_token=token, role=user.role.value)


@router.get("/invite-info")
def get_invite_info(token: str, db: Session = Depends(get_db)):
    """Returns basic info about an invitation so the frontend can display it."""
    user = db.query(User).filter(User.invite_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired invitation",
        )
    if user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already accepted",
        )
    return {"email": user.email}


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    """Public client self-registration."""
    existing = db.query(User).filter(User.email == body.email).first()

    if existing:
        if existing.password_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Please sign in.",
            )
        # Invite-only user hasn't set password yet — claim the account
        password_hash = hashpw(body.password.encode("utf-8"), gensalt()).decode("utf-8")
        existing.password_hash = password_hash
        existing.invite_token = None
        db.commit()
        token = create_access_token(str(existing.id), existing.role.value)
        return LoginResponse(access_token=token, role=existing.role.value)

    # New user
    password_hash = hashpw(body.password.encode("utf-8"), gensalt()).decode("utf-8")
    user = User(
        email=body.email,
        password_hash=password_hash,
        role=UserRole.client,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id), user.role.value)
    return LoginResponse(access_token=token, role=user.role.value)
