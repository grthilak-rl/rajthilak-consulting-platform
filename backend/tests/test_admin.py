import pytest


VALID_REQUIREMENT = {
    "name": "Alice",
    "email": "alice@example.com",
    "title": "Cloud Migration",
    "description": "Migrate to AWS.",
    "type": "contract",
}


async def create_requirement(client):
    """Helper to create a requirement and return its id."""
    res = await client.post("/api/public/requirements", json=VALID_REQUIREMENT)
    assert res.status_code == 201
    return res.json()["id"]


@pytest.mark.anyio
async def test_list_requirements(client, auth_headers):
    await create_requirement(client)
    await create_requirement(client)

    res = await client.get("/api/admin/requirements", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


@pytest.mark.anyio
async def test_get_requirement(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.get(f"/api/admin/requirements/{req_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Cloud Migration"


@pytest.mark.anyio
async def test_get_requirement_not_found(client, auth_headers):
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = await client.get(f"/api/admin/requirements/{fake_id}", headers=auth_headers)
    assert res.status_code == 404


@pytest.mark.anyio
async def test_update_status(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.patch(
        f"/api/admin/requirements/{req_id}/status",
        headers=auth_headers,
        json={"status": "accepted"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "accepted"


@pytest.mark.anyio
async def test_update_status_invalid(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.patch(
        f"/api/admin/requirements/{req_id}/status",
        headers=auth_headers,
        json={"status": "bogus"},
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_update_progress(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.patch(
        f"/api/admin/requirements/{req_id}/progress",
        headers=auth_headers,
        json={"progress": 75},
    )
    assert res.status_code == 200
    assert res.json()["progress"] == 75


@pytest.mark.anyio
async def test_update_progress_out_of_range(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.patch(
        f"/api/admin/requirements/{req_id}/progress",
        headers=auth_headers,
        json={"progress": 150},
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_create_and_list_notes(client, auth_headers):
    req_id = await create_requirement(client)

    res = await client.post(
        f"/api/admin/requirements/{req_id}/notes",
        headers=auth_headers,
        json={"content": "Initial review done."},
    )
    assert res.status_code == 201
    note = res.json()
    assert note["content"] == "Initial review done."
    assert note["requirement_id"] == req_id

    res = await client.get(
        f"/api/admin/requirements/{req_id}/notes",
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert len(res.json()) == 1
