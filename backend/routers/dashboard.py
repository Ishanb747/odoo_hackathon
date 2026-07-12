"""
routers/dashboard.py — Phase 7
Dashboard APIs for KPI, overdue alerts, and recent activity
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db
from models import (
    Asset, AssetStatus, Allocation, TransferRequest, TransferStatus,
    Booking, BookingStatus, Employee, ActivityLog
)
from routers.auth import get_current_user

router = APIRouter()

# ── Pydantic Schemas ──────────────────────────────────────────

class DashboardKPIsOut(BaseModel):
    available_assets: int
    allocated_assets: int
    maintenance_assets: int
    active_bookings: int
    pending_transfers: int
    upcoming_returns: int

class ActivityLogOut(BaseModel):
    id: int
    message: str
    created_at: datetime

class OverdueAlertOut(BaseModel):
    asset_id: int
    asset_tag: str
    allocated_to: str
    days_overdue: int

class StatusDistributionOut(BaseModel):
    name: str
    value: int
    color: str

class DepartmentUtilizationOut(BaseModel):
    name: str
    count: int

class DashboardDataOut(BaseModel):
    kpis: DashboardKPIsOut
    recent_activity: list[ActivityLogOut]
    overdue_alerts: list[OverdueAlertOut]
    status_distribution: list[StatusDistributionOut]
    department_utilization: list[DepartmentUtilizationOut]

# ── Endpoints ─────────────────────────────────────────────────

@router.get("", response_model=DashboardDataOut)
def get_dashboard_data(
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user)
):
    # KPIs
    asset_counts = db.query(Asset.status, func.count(Asset.id)).group_by(Asset.status).all()
    asset_status_map = dict(asset_counts)
    
    available = asset_status_map.get(AssetStatus.available, 0)
    allocated = asset_status_map.get(AssetStatus.allocated, 0)
    maintenance = asset_status_map.get(AssetStatus.maintenance, 0)
    
    active_bookings = db.query(Booking).filter(Booking.status == BookingStatus.confirmed).count()
    pending_transfers = db.query(TransferRequest).filter(TransferRequest.status == TransferStatus.pending).count()
    
    # Active allocations
    active_allocations_query = db.query(Allocation).filter(Allocation.returned_at == None)
    upcoming_returns = active_allocations_query.count()

    kpis = DashboardKPIsOut(
        available_assets=available,
        allocated_assets=allocated,
        maintenance_assets=maintenance,
        active_bookings=active_bookings,
        pending_transfers=pending_transfers,
        upcoming_returns=upcoming_returns
    )

    # Overdue alerts (simulated by checking allocations older than 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    now_utc = datetime.now(timezone.utc)

    overdue_results = (
        db.query(Allocation, Asset, Employee)
        .join(Asset, Allocation.asset_id == Asset.id)
        .join(Employee, Allocation.employee_id == Employee.id)
        .filter(Allocation.returned_at == None, Allocation.allocated_at < thirty_days_ago)
        .all()
    )
    
    overdue_alerts = []
    for alloc, asset, emp in overdue_results:
        days = (now_utc - alloc.allocated_at).days - 30
        overdue_alerts.append(
            OverdueAlertOut(
                asset_id=asset.id,
                asset_tag=asset.tag,
                allocated_to=emp.name,
                days_overdue=days if days > 0 else 1
            )
        )

    # Recent activity
    logs = db.query(ActivityLog).order_by(desc(ActivityLog.created_at)).limit(10).all()
    recent_activity = [
        ActivityLogOut(id=log.id, message=log.message, created_at=log.created_at)
        for log in logs
    ]

    # Charts Data
    status_distribution = [
        {"name": "Available", "value": available, "color": "var(--color-success)"},
        {"name": "Allocated", "value": allocated, "color": "var(--color-primary)"},
        {"name": "Maintenance", "value": maintenance, "color": "var(--color-warning)"}
    ]

    from models import Department
    
    dept_counts = (
        db.query(Department.name, func.count(Allocation.id))
        .select_from(Allocation)
        .join(Employee, Allocation.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .filter(Allocation.returned_at == None)
        .group_by(Department.name)
        .all()
    )
    
    department_utilization = [
        {"name": dept_name, "count": count} for dept_name, count in dept_counts
    ]

    return DashboardDataOut(
        kpis=kpis,
        recent_activity=recent_activity,
        overdue_alerts=overdue_alerts,
        status_distribution=status_distribution,
        department_utilization=department_utilization
    )
