import pytest


VALID_REQUIREMENT = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "company": "Acme Corp",
    "title": "Build a REST API",
    "description": "We need a scalable REST API for our platform.",
    "type": "contract",
    "tech_stack": "Python, FastAPI",
    "timeline": "4 weeks",
}


@pytest.mark.anyio
async def test_submit_requirement(client):
    res = await client.post("/api/public/requirements", json=VALID_REQUIREMENT)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"
    assert data["status"] == "new"
    assert data["progress"] == 0
    assert "id" in data


@pytest.mark.anyio
async def test_submit_requirement_minimal(client):
    payload = {
        "name": "Bob",
        "email": "bob@test.com",
        "title": "Quick consult",
        "description": "Need help with architecture.",
        "type": "one_off",
    }
    res = await client.post("/api/public/requirements", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["company"] is None
    assert data["tech_stack"] is None
    assert data["timeline"] is None


@pytest.mark.anyio
async def test_submit_requirement_missing_fields(client):
    res = await client.post("/api/public/requirements", json={"name": "Incomplete"})
    assert res.status_code == 400


@pytest.mark.anyio
async def test_submit_requirement_invalid_email(client):
    payload = {**VALID_REQUIREMENT, "email": "not-an-email"}
    res = await client.post("/api/public/requirements", json=payload)
    assert res.status_code == 400


@pytest.mark.anyio
async def test_submit_requirement_invalid_type(client):
    payload = {**VALID_REQUIREMENT, "type": "invalid_type"}
    res = await client.post("/api/public/requirements", json=payload)
    assert res.status_code == 400
