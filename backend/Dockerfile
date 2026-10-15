FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy alembic config and migrations
COPY alembic.ini .
COPY alembic/ ./alembic/

# Copy application code
COPY app/ ./app/

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Run migrations then start uvicorn
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
