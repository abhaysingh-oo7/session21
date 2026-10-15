from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from app.database import Base
import enum


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Status(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(Status, name="task_status"),
        default=Status.todo,
        nullable=False
    )
    priority = Column(
        Enum(Priority, name="task_priority"),
        default=Priority.medium,
        nullable=False
    )
    assignee = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
