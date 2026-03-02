import pytest

from tests.conftest import (
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    CLIENT_EMAIL,
    CLIENT_PASSWORD,
    EDITOR_EMAIL,
    EDITOR_PASSWORD,
)


@pytest.mark.anyio
async def test_login_success(client, admin_user):
    res = await client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"


@pytest.mark.anyio
async def test_login_returns_editor_role(client, editor_user):
    res = await client.post(
        "/api/auth/login",
        json={"email": EDITOR_EMAIL, "password": EDITOR_PASSWORD},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "editor"


@pytest.mark.anyio
async def test_login_wrong_password(client, admin_user):
    res = await client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": "wrongpassword"},
    )
    assert res.status_code == 401


@pytest.mark.anyio
async def test_login_unknown_email(client, admin_user):
    res = await client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "whatever"},
    )
    assert res.status_code == 401


@pytest.mark.anyio
async def test_admin_requires_auth(client):
    res = await client.get("/api/admin/requirements")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_rejects_invalid_token(client):
    res = await client.get(
        "/api/admin/requirements",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert res.status_code == 401


@pytest.mark.anyio
async def test_admin_with_valid_token(client, auth_headers):
    res = await client.get("/api/admin/requirements", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.anyio
async def test_editor_cannot_access_requirements(client, editor_headers):
    res = await client.get("/api/admin/requirements", headers=editor_headers)
    assert res.status_code == 403


@pytest.mark.anyio
async def test_editor_can_access_case_studies(client, editor_headers):
    res = await client.get("/api/admin/case-studies", headers=editor_headers)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_editor_can_access_site_content(client, editor_headers):
    res = await client.get("/api/admin/site-content", headers=editor_headers)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_client_cannot_access_admin(client, client_headers):
    res = await client.get("/api/admin/requirements", headers=client_headers)
    assert res.status_code == 403


@pytest.mark.anyio
async def test_client_cannot_access_case_studies_admin(client, client_headers):
    res = await client.get("/api/admin/case-studies", headers=client_headers)
    assert res.status_code == 403


# ── Registration tests ─────────────────────────────────────────────


@pytest.mark.anyio
async def test_register_new_client(client):
    res = await client.post(
        "/api/auth/register",
        json={"email": "newclient@example.com", "password": "securepass123"},
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "client"
    assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_register_duplicate_email(client, client_user):
    res = await client.post(
        "/api/auth/register",
        json={"email": CLIENT_EMAIL, "password": "anotherpass123"},
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]


@pytest.mark.anyio
async def test_register_claims_invited_user(client, db):
    from app.models.user import User, UserRole

    user = User(
        email="invited@example.com",
        role=UserRole.client,
        invite_token="abc123",
    )
    db.add(user)
    db.commit()

    res = await client.post(
        "/api/auth/register",
        json={"email": "invited@example.com", "password": "claimpass123"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["role"] == "client"
    assert "access_token" in data

    db.refresh(user)
    assert user.password_hash is not None
    assert user.invite_token is None


@pytest.mark.anyio
async def test_register_then_login(client):
    await client.post(
        "/api/auth/register",
        json={"email": "reg@example.com", "password": "mypassword123"},
    )
    res = await client.post(
        "/api/auth/login",
        json={"email": "reg@example.com", "password": "mypassword123"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "client"
