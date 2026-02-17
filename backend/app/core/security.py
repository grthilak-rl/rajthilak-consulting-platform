from datetime import datetime, timedelta, timezone

import jwt
from bcrypt import checkpw

from app.core.config import JWT_SECRET, JWT_EXPIRES_IN


def verify_password(plain_password: str, password_hash: str) -> bool:
    return checkpw(
        plain_password.encode("utf-8"), password_hash.encode("utf-8")
    )


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRES_IN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_access_token(token: str) -> dict:
    """Decode and verify a JWT token. Returns the payload on success,
    or None if the token is invalid or expired."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        return None
