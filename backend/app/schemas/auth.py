from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    role: str
    token_type: str = "bearer"


class InviteAcceptRequest(BaseModel):
    token: str
    password: str


class InviteAcceptResponse(BaseModel):
    access_token: str
    role: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
