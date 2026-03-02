from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import verify_access_token

bearer_scheme = HTTPBearer()


@dataclass
class CurrentUser:
    id: str
    role: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    """FastAPI dependency that extracts and validates a Bearer token.
    Returns a CurrentUser with id and role on success.
    Raises 401 if the token is missing, invalid, or expired."""
    payload = verify_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return CurrentUser(
        id=payload["sub"],
        role=payload.get("role", "admin"),
    )


def require_role(*roles: str):
    """Returns a dependency that checks the user has one of the specified roles."""
    def checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user
    return checker


require_admin = require_role("admin")
require_admin_or_editor = require_role("admin", "editor")
require_client = require_role("client")
