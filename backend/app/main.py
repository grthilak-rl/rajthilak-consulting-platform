from fastapi import Depends, FastAPI

from app.api import public, auth, admin
from app.core.deps import get_current_user

app = FastAPI(title="Consulting Platform API")

app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(
    admin.router,
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_user)],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
