"""
routers/reports.py — Phase 7 (Reports Dashboard)
Aggregates data for the reports screen.
"""
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.asset import Asset, AssetStatus
from models.department import Department
from models.allocation import Allocation
from models.booking import Booking
from models.maintenance import MaintenanceRequest
from routers.auth import get_current_user
from models.employee import Employee

router = APIRouter()

@router.get("/dashboard")
def get_reports_dashboard(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    sixty_days_ago = now - timedelta(days=60)
    
    # 1. Asset Status Distribution
    all_assets = db.query(Asset).all()
    status_counts = {"available": 0, "allocated": 0, "maintenance": 0, "lost": 0}
    for a in all_assets:
        status_counts[a.status.value] += 1
    total_assets = len(all_assets)
    status_distribution = {
        "total": total_assets,
        "available": status_counts["available"],
        "allocated": status_counts["allocated"],
        "maintenance": status_counts["maintenance"],
        "lost": status_counts["lost"]
    }

    # 2. Department Utilization
    departments = db.query(Department).all()
    utilization = []
    for d in departments:
        dept_total = sum(1 for a in all_assets if a.department_id == d.id)
        allocations_count = db.query(Allocation).join(Asset).filter(
            Asset.department_id == d.id,
            Allocation.returned_at == None
        ).count()
        utilization.append({
            "department": d.name,
            "total_assets": dept_total,
            "in_use": allocations_count,
            "percentage": int((allocations_count / dept_total) * 100) if dept_total > 0 else 0
        })

    # 3. Maintenance Pipeline
    m_reqs = db.query(MaintenanceRequest).all()
    pipeline = {"pending": 0, "approved": 0, "in_progress": 0, "resolved": 0}
    for req in m_reqs:
        # handle safe string matching for statuses
        s = req.status.value if hasattr(req.status, 'value') else str(req.status)
        if "pending" in s: pipeline["pending"] += 1
        elif "approved" in s: pipeline["approved"] += 1
        elif "in_progress" in s or "progress" in s: pipeline["in_progress"] += 1
        elif "resolved" in s: pipeline["resolved"] += 1

    # 4. Audit Health Score
    from models.audit import AuditCycle, AuditRecord, VerificationStatus
    latest_cycle = db.query(AuditCycle).filter(AuditCycle.closed == True).order_by(AuditCycle.closed_at.desc()).first()
    audit_health = {"cycle_name": "No closed audits", "match_rate": 100, "verified": 0, "missing": 0, "damaged": 0}
    if latest_cycle:
        records = db.query(AuditRecord).filter(AuditRecord.cycle_id == latest_cycle.id).all()
        total_recs = len(records)
        ver = sum(1 for r in records if r.verification_status == VerificationStatus.verified)
        mis = sum(1 for r in records if r.verification_status == VerificationStatus.missing)
        dam = sum(1 for r in records if r.verification_status == VerificationStatus.damaged)
        
        audit_health = {
            "cycle_name": latest_cycle.name,
            "match_rate": int((ver / total_recs) * 100) if total_recs > 0 else 100,
            "verified": ver,
            "missing": mis,
            "damaged": dam
        }

    # 5. Resource Booking Popularity
    bookings = db.query(Booking).all()
    resource_counts = {}
    for b in bookings:
        resource_counts[b.resource_name] = resource_counts.get(b.resource_name, 0) + 1
    
    top_resources = []
    for r_name, count in sorted(resource_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        top_resources.append({"name": r_name, "bookings": count})

    # 6. Aging Assets (Risk List)
    three_years_ago = now.date() - timedelta(days=1095)
    retirement_assets = db.query(Asset).filter(
        Asset.acquisition_date != None,
        Asset.acquisition_date < three_years_ago,
        Asset.status != AssetStatus.lost
    ).limit(5).all()
    
    due_for_maintenance = []
    for a in retirement_assets:
        days_old = (now.date() - a.acquisition_date).days if a.acquisition_date else 0
        due_for_maintenance.append({
            "id": a.id,
            "tag": a.tag,
            "name": a.name,
            "reason": f"Acquired {days_old // 365} years ago"
        })

    return {
        "status_distribution": status_distribution,
        "utilization_by_department": utilization,
        "maintenance_pipeline": pipeline,
        "audit_health": audit_health,
        "top_resources": top_resources,
        "aging_assets": due_for_maintenance
    }
