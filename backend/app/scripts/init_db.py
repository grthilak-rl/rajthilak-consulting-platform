import time

from bcrypt import hashpw, gensalt
from sqlalchemy.exc import OperationalError

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.database import Base, engine, SessionLocal
from app.models import User
from app.models.requirement import Requirement, RequirementType, RequirementStatus

MAX_RETRIES = 10
RETRY_DELAY = 2


def init_db():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Connecting to database (attempt {attempt}/{MAX_RETRIES})...")
            Base.metadata.create_all(bind=engine)
            print("Tables created.")
            break
        except OperationalError:
            if attempt == MAX_RETRIES:
                print("Could not connect to database. Giving up.")
                raise
            print(f"Database not ready. Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)

    seed_admin()
    seed_requirements()


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


def seed_requirements():
    db = SessionLocal()
    try:
        count = db.query(Requirement).count()
        if count > 0:
            print(f"Requirements already seeded ({count} found). Skipping.")
            return

        requirements = [
            Requirement(
                name="Alice Johnson",
                email="alice@techcorp.io",
                company="TechCorp",
                title="Cloud Migration Strategy",
                description="We need help migrating our on-premise infrastructure to AWS. Looking for architecture review, migration planning, and hands-on support for containerizing our services.",
                type=RequirementType.contract,
                tech_stack="AWS, Docker, Kubernetes, Terraform",
                timeline="3 months",
                status=RequirementStatus.new,
                progress=0,
            ),
            Requirement(
                name="Bob Martinez",
                email="bob@startupxyz.com",
                company="StartupXYZ",
                title="MVP Development for SaaS Platform",
                description="Early-stage startup looking for a technical consultant to help build our MVP. Need full-stack development guidance, tech stack selection, and hands-on coding support.",
                type=RequirementType.one_off,
                tech_stack="React, Python, PostgreSQL",
                timeline="6 weeks",
                status=RequirementStatus.new,
                progress=0,
            ),
        ]

        db.add_all(requirements)
        db.commit()
        print(f"Seeded {len(requirements)} sample requirements.")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
