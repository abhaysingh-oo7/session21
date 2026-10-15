from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models import Status, Priority


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Status = Status.todo
    priority: Priority = Priority.medium
    assignee: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None
    priority: Optional[Priority] = None
    assignee: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: Status
    priority: Priority
    assignee: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    review: int
    done: int
    high_priority: int
    critical_priority: int
