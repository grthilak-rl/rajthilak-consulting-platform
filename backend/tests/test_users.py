import pytest

from tests.conftest import ADMIN_EMAIL


@pytest.mark.anyio
async def test_admin_can_list_users(client, auth_headers):
    res = await client.get("/api/admin/users/", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.anyio
async def test_editor_cannot_manage_users(client, editor_headers):
    res = await client.get("/api/admin/users/", headers=editor_headers)
    assert res.status_code == 403


@pytest.mark.anyio
async def test_client_cannot_manage_users(client, client_headers):
    res = await client.get("/api/admin/users/", headers=client_headers)
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_can_create_editor(client, auth_headers):
    res = await client.post(
        "/api/admin/users/",
        headers=auth_headers,
        json={"email": "newintern@test.com", "password": "internpass", "role": "editor"},
    )
    assert res.status_code == 201
    assert res.json()["role"] == "editor"
    assert res.json()["email"] == "newintern@test.com"


@pytest.mark.anyio
async def test_admin_can_create_client(client, auth_headers):
    res = await client.post(
        "/api/admin/users/",
        headers=auth_headers,
        json={"email": "newclient@test.com", "password": "clientpass", "role": "client"},
    )
    assert res.status_code == 201
    assert res.json()["role"] == "client"


@pytest.mark.anyio
async def test_cannot_create_duplicate_email(client, auth_headers, admin_user):
    res = await client.post(
        "/api/admin/users/",
        headers=auth_headers,
        json={"email": ADMIN_EMAIL, "password": "pass", "role": "editor"},
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_admin_can_update_user_role(client, auth_headers, editor_user):
    res = await client.patch(
        f"/api/admin/users/{editor_user.id}",
        headers=auth_headers,
        json={"role": "admin"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "admin"


@pytest.mark.anyio
async def test_admin_can_delete_user(client, auth_headers, editor_user):
    res = await client.delete(
        f"/api/admin/users/{editor_user.id}",
        headers=auth_headers,
    )
    assert res.status_code == 204


@pytest.mark.anyio
async def test_admin_cannot_delete_self(client, auth_headers, admin_user):
    res = await client.delete(
        f"/api/admin/users/{admin_user.id}",
        headers=auth_headers,
    )
    assert res.status_code == 400
