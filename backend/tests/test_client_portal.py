import pytest

from app.models.requirement import Requirement, RequirementType, RequirementStatus
from tests.conftest import CLIENT_EMAIL


@pytest.mark.anyio
async def test_client_sees_own_requirements(client, client_headers, db):
    req = Requirement(
        name="Client User",
        email=CLIENT_EMAIL,
        title="My Project",
        description="Test project",
        type=RequirementType.contract,
    )
    db.add(req)
    db.commit()

    res = await client.get("/api/client/requirements", headers=client_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "My Project"


@pytest.mark.anyio
async def test_client_cannot_see_other_requirements(client, client_headers, db):
    req = Requirement(
        name="Other User",
        email="other@test.com",
        title="Other Project",
        description="Not mine",
        type=RequirementType.contract,
    )
    db.add(req)
    db.commit()

    res = await client.get("/api/client/requirements", headers=client_headers)
    assert res.status_code == 200
    assert len(res.json()) == 0


@pytest.mark.anyio
async def test_client_submit_testimonial_on_completed(client, client_headers, db):
    req = Requirement(
        name="Client User",
        email=CLIENT_EMAIL,
        company="TestCorp",
        title="Done Project",
        description="Completed work",
        type=RequirementType.contract,
        status=RequirementStatus.completed,
    )
    db.add(req)
    db.commit()

    res = await client.post(
        f"/api/client/requirements/{req.id}/testimonial",
        headers=client_headers,
        json={"content": "Great work!", "rating": 5},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["content"] == "Great work!"
    assert data["rating"] == 5
    assert data["author_name"] == "Client User"
    assert data["author_company"] == "TestCorp"


@pytest.mark.anyio
async def test_client_cannot_submit_testimonial_on_incomplete(client, client_headers, db):
    req = Requirement(
        name="Client User",
        email=CLIENT_EMAIL,
        title="WIP Project",
        description="Still working",
        type=RequirementType.contract,
        status=RequirementStatus.in_progress,
    )
    db.add(req)
    db.commit()

    res = await client.post(
        f"/api/client/requirements/{req.id}/testimonial",
        headers=client_headers,
        json={"content": "Great work!", "rating": 5},
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_admin_cannot_access_client_portal(client, auth_headers):
    res = await client.get("/api/client/requirements", headers=auth_headers)
    assert res.status_code == 403
