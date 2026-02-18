import pytest

from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


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
