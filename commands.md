# TaskBoard — Docker Commands for Screenshots

All commands are run from the **project root** (`session21/`) unless noted.

---

## 1. Check Docker is installed

```bash
docker --version
docker compose version
```

---

## 2. Build and Start the Full Stack

```bash
docker compose up --build
```

> This builds both images, starts PostgreSQL, backend, and frontend.
> Wait until you see `Application startup complete`.

---

## 3. Check Running Containers

```bash
docker ps
```

Expected output: 3 containers — `taskboard-db`, `taskboard-backend`, `taskboard-frontend`

---

## 4. Check Logs

```bash
# All services
docker compose logs

# Backend only
docker compose logs backend

# Follow live logs
docker compose logs -f backend
```

---

## 5. Test Backend Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Ready check (tests DB connection)
curl http://localhost:8000/ready

# List all tasks
curl http://localhost:8000/api/tasks

# Task stats
curl http://localhost:8000/api/tasks/stats

# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to Kubernetes", "priority": "high", "status": "todo", "assignee": "Alice"}'

# Get Prometheus metrics
curl http://localhost:8000/metrics
```

---

## 6. Open the App

Open your browser:

```
http://localhost:3000          # Frontend (React dashboard)
http://localhost:8000/docs     # Swagger API docs
http://localhost:8000/health   # Health endpoint
http://localhost:8000/metrics  # Prometheus metrics
```

---

## 7. List Docker Images

```bash
docker images | grep taskboard
```

---

## 8. Inspect a Container

```bash
docker inspect taskboard-backend
```

---

## 9. Exec into Backend Container

```bash
docker exec -it taskboard-backend bash
# Inside the container:
# ps aux
# env | grep DATABASE
# exit
```

---

## 10. Stop the Stack

```bash
docker compose down
```

---

## 11. Stop and Delete Volumes (wipes DB)

```bash
docker compose down -v
```

---

## 12. Build Backend Image Standalone

```bash
docker build -t taskboard-backend:local ./backend
```

---

## 13. Build Frontend Image Standalone

```bash
docker build -t taskboard-frontend:local ./frontend
```

---

## 14. Run Pytest (outside Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

---

## 15. View Docker Volumes

```bash
docker volume ls
docker volume inspect session21_pgdata
```

---

## 16. Check Container Resource Usage

```bash
docker stats
```

---

## Notes for Screenshots

| URL / Command | What to screenshot |
|---|---|
| `docker compose up --build` | Build output — both images building |
| `docker ps` | 3 containers running |
| `http://localhost:3000` | Full TaskBoard UI |
| Create a task in UI | Modal → task appears in table |
| `http://localhost:8000/docs` | Swagger UI |
| `curl /health` | `{"status":"healthy"}` |
| `curl /metrics` | Prometheus output |
| `pytest -v` | All tests passing |
| `docker images` | Both images listed |
