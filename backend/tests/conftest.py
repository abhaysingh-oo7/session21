import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db

# Use SQLite in-memory for tests (no PostgreSQL needed in CI)
SQLALCHEMY_TEST_URL = "sqlite:///./test_taskboard.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client(setup_db):
    # Patch the engine BEFORE importing the app so lifespan uses test DB
    import app.database as db_module
    original_engine = db_module.engine
    db_module.engine = engine_test

    from app.main import app
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    db_module.engine = original_engine
