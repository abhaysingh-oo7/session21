from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import engine, get_db
from app.models import Base
from app.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (for dev; prod uses Alembic)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="TaskBoard API",
    description="SaaS-style task management API for Session 21 DevOps Capstone",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)

app.include_router(router)


@app.get("/")
def root():
    return {"application": "TaskBoard", "version": "1.0.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/ready")
def ready():
    # Check database connectivity
    try:
        db = next(get_db())
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        from fastapi import Response
        return {"status": "not ready", "database": str(e)}
