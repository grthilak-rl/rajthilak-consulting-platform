import pytest

from app.models.requirement import Requirement, RequirementType
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


@pytest.mark.anyio
async def test_accept_requirement_generates_invite(client, auth_headers, db):
    req = Requirement(
        name="Alice Johnson",
        email="alice@example.com",
        title="Cloud Migration",
        description="Need help with AWS",
        type=RequirementType.contract,
    )
    db.add(req)
    db.commit()

    res = await client.patch(
        f"/api/admin/requirements/{req.id}/status",
        headers=auth_headers,
        json={"status": "accepted"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["invite_link"] is not None
    assert "/invite/" in data["invite_link"]


@pytest.mark.anyio
async def test_accept_invite_flow(client, auth_headers, db):
    # Step 1: Create requirement
    req = Requirement(
        name="Bob Test",
        email="bob@example.com",
        title="MVP Build",
        description="Build an MVP",
        type=RequirementType.one_off,
    )
    db.add(req)
    db.commit()

    # Step 2: Admin accepts -> generates invite
    res = await client.patch(
        f"/api/admin/requirements/{req.id}/status",
        headers=auth_headers,
        json={"status": "accepted"},
    )
    invite_link = res.json()["invite_link"]
    token = invite_link.split("/invite/")[1]

    # Step 3: Check invite info
    res = await client.get(f"/api/auth/invite-info?token={token}")
    assert res.status_code == 200
    assert res.json()["email"] == "bob@example.com"

    # Step 4: Accept invite
    res = await client.post(
        "/api/auth/accept-invite",
        json={"token": token, "password": "newpass123"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "client"
    assert "access_token" in res.json()

    # Step 5: Can now login
    res = await client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "newpass123"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "client"


@pytest.mark.anyio
async def test_cannot_reuse_invite(client, auth_headers, db):
    req = Requirement(
        name="Carol Test",
        email="carol@example.com",
        title="Project",
        description="A project",
        type=RequirementType.contract,
    )
    db.add(req)
    db.commit()

    res = await client.patch(
        f"/api/admin/requirements/{req.id}/status",
        headers=auth_headers,
        json={"status": "accepted"},
    )
    token = res.json()["invite_link"].split("/invite/")[1]

    # Accept first time
    res = await client.post(
        "/api/auth/accept-invite",
        json={"token": token, "password": "pass1"},
    )
    assert res.status_code == 200

    # Try again — token is now cleared
    res = await client.post(
        "/api/auth/accept-invite",
        json={"token": token, "password": "pass2"},
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_invalid_invite_token(client):
    res = await client.get("/api/auth/invite-info?token=nonexistent")
    assert res.status_code == 404

    res = await client.post(
        "/api/auth/accept-invite",
        json={"token": "nonexistent", "password": "pass"},
    )
    assert res.status_code == 400
