from fastapi import FastAPI
from app.api import public, auth, admin

app = FastAPI(title="Consulting Platform API")

app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
