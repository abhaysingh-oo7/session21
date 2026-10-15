def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["application"] == "TaskBoard"
    assert data["status"] == "running"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_task(client):
    payload = {
        "title": "Write unit tests",
        "description": "Add tests for all API endpoints",
        "status": "todo",
        "priority": "high",
        "assignee": "alice"
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Write unit tests"
    assert data["priority"] == "high"
    assert "id" in data


def test_list_tasks(client):
    # Create two tasks first
    client.post("/api/tasks", json={"title": "Task A", "priority": "low"})
    client.post("/api/tasks", json={"title": "Task B", "priority": "high"})

    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2


def test_get_task(client):
    create_resp = client.post("/api/tasks", json={"title": "Find Me"})
    task_id = create_resp.json()["id"]

    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Find Me"


def test_get_task_not_found(client):
    response = client.get("/api/tasks/9999")
    assert response.status_code == 404


def test_update_task(client):
    create_resp = client.post("/api/tasks", json={"title": "Old Title"})
    task_id = create_resp.json()["id"]

    response = client.put(f"/api/tasks/{task_id}", json={"title": "New Title", "status": "in_progress"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["status"] == "in_progress"


def test_delete_task(client):
    create_resp = client.post("/api/tasks", json={"title": "Delete Me"})
    task_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/tasks/{task_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/tasks/{task_id}")
    assert get_resp.status_code == 404


def test_stats(client):
    client.post("/api/tasks", json={"title": "T1", "status": "todo", "priority": "high"})
    client.post("/api/tasks", json={"title": "T2", "status": "done", "priority": "critical"})
    client.post("/api/tasks", json={"title": "T3", "status": "in_progress", "priority": "low"})

    response = client.get("/api/tasks/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 3
    assert stats["todo"] == 1
    assert stats["done"] == 1
    assert stats["in_progress"] == 1
    assert stats["high_priority"] == 1
    assert stats["critical_priority"] == 1


def test_filter_by_status(client):
    client.post("/api/tasks", json={"title": "T1", "status": "todo"})
    client.post("/api/tasks", json={"title": "T2", "status": "done"})

    response = client.get("/api/tasks?status=done")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["status"] == "done"
