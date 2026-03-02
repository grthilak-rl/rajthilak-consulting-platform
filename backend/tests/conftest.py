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
from app.models.user import User, UserRole

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

EDITOR_EMAIL = "editor@test.com"
EDITOR_PASSWORD = "editorpass123"

CLIENT_EMAIL = "client@test.com"
CLIENT_PASSWORD = "clientpass123"


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
    user = User(email=ADMIN_EMAIL, password_hash=password_hash, role=UserRole.admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def editor_user(db):
    """Create an editor user and return it."""
    password_hash = hashpw(
        EDITOR_PASSWORD.encode("utf-8"), gensalt()
    ).decode("utf-8")
    user = User(email=EDITOR_EMAIL, password_hash=password_hash, role=UserRole.editor)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def client_user(db):
    """Create a client user and return it."""
    password_hash = hashpw(
        CLIENT_PASSWORD.encode("utf-8"), gensalt()
    ).decode("utf-8")
    user = User(email=CLIENT_EMAIL, password_hash=password_hash, role=UserRole.client)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def auth_headers(admin_user):
    """Return Authorization headers for the admin user."""
    token = create_access_token(str(admin_user.id), admin_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def editor_headers(editor_user):
    """Return Authorization headers for the editor user."""
    token = create_access_token(str(editor_user.id), editor_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client_headers(client_user):
    """Return Authorization headers for the client user."""
    token = create_access_token(str(client_user.id), client_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client():
    """Provide an async test client."""
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")
