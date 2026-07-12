"""
routers/notifications.py — Phase 7 (Activity Logs & Notifications)
Fetches and updates read state for ActivityLog entries.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.notification import ActivityLog, LogType
from routers.auth import get_current_user
from models.employee import Employee

router = APIRouter()

class ActivityLogResponse(BaseModel):
    id: int
    type: LogType
    message: str
    employee_id: Optional[int]
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[ActivityLogResponse])
def get_notifications(
    type_filter: Optional[LogType] = Query(None, description="Filter by log type (alert, booking, etc)"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(ActivityLog)
    
    if type_filter:
        query = query.filter(ActivityLog.type == type_filter)
        
    # In a real system we'd filter by employee_id for user-specific notifications,
    # but the mockup implies a global activity feed for admins. 
    # For now, we'll return all logs since it's an admin view.
    logs = query.order_by(ActivityLog.created_at.desc()).limit(100).all()
    return logs

@router.patch("/{log_id}/read", response_model=ActivityLogResponse)
def mark_notification_read(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    log_entry = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    log_entry.read = True
    db.commit()
    db.refresh(log_entry)
    
    return log_entry

@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Mark all unread as read
    db.query(ActivityLog).filter(ActivityLog.read == False).update({"read": True})
    db.commit()
    return {"status": "ok"}
