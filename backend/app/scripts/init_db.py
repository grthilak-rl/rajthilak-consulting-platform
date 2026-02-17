import sys

from bcrypt import hashpw, gensalt

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.database import Base, engine, SessionLocal
from app.models import User


def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    seed_admin()


def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"Admin user already exists: {ADMIN_EMAIL}")
            return

        password_hash = hashpw(
            ADMIN_PASSWORD.encode("utf-8"), gensalt()
        ).decode("utf-8")

        admin = User(email=ADMIN_EMAIL, password_hash=password_hash)
        db.add(admin)
        db.commit()
        print(f"Admin user created: {ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
