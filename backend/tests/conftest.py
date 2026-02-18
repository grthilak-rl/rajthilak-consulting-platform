import pytest
from bcrypt import gensalt, hashpw
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.limiter import limiter
from app.core.security import create_access_token
from app.main import app
from app.models.user import User

# Use in-memory SQLite for tests — StaticPool ensures a single shared connection
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# SQLite doesn't enforce FK constraints by default
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

ADMIN_EMAIL = "test@admin.com"
ADMIN_PASSWORD = "testpassword123"


@pytest.fixture(autouse=True)
def setup_db():
    """Create all tables before each test, drop after. Reset rate limiter."""
    limiter.reset()
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Provide a test DB session."""
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def admin_user(db):
    """Create an admin user and return it."""
    password_hash = hashpw(
        ADMIN_PASSWORD.encode("utf-8"), gensalt()
    ).decode("utf-8")
    user = User(email=ADMIN_EMAIL, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def auth_headers(admin_user):
    """Return Authorization headers for the admin user."""
    token = create_access_token(str(admin_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client():
    """Provide an async test client."""
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")
