from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Task, Status, Priority
from app.schemas import TaskCreate, TaskUpdate, TaskOut, TaskStats

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskOut])
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    return query.order_by(Task.created_at.desc()).all()


@router.get("/stats", response_model=TaskStats)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Task).count()
    todo = db.query(Task).filter(Task.status == Status.todo).count()
    in_progress = db.query(Task).filter(Task.status == Status.in_progress).count()
    review = db.query(Task).filter(Task.status == Status.review).count()
    done = db.query(Task).filter(Task.status == Status.done).count()
    high_priority = db.query(Task).filter(Task.priority == Priority.high).count()
    critical_priority = db.query(Task).filter(Task.priority == Priority.critical).count()
    return TaskStats(
        total=total,
        todo=todo,
        in_progress=in_progress,
        review=review,
        done=done,
        high_priority=high_priority,
        critical_priority=critical_priority,
    )


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
