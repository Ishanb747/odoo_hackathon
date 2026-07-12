"""
routers/maintenance.py — Phase 5 (Maintenance Workflow)
Kanban board for maintenance requests
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.maintenance import MaintenanceRequest, MaintenanceStatus
from models.asset import Asset, AssetStatus
from models.employee import Employee
from routers.auth import get_current_user

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────

class MaintenanceCreate(BaseModel):
    asset_id: int
    issue_description: str
    notes: Optional[str] = None

class MaintenanceStatusUpdate(BaseModel):
    status: MaintenanceStatus
    technician_name: Optional[str] = None
    notes: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: int
    asset_id: int
    asset_name: str
    asset_tag: str
    reported_by: int
    reporter_name: str
    issue_description: str
    status: MaintenanceStatus
    technician_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

# ── Endpoints ─────────────────────────────────────────────────

@router.get("", response_model=List[MaintenanceResponse])
def get_maintenance_requests(db: Session = Depends(get_db)):
    """Fetch all maintenance requests."""
    reqs = db.query(MaintenanceRequest).order_by(MaintenanceRequest.created_at.desc()).all()
    results = []
    for r in reqs:
        ast = db.query(Asset).filter(Asset.id == r.asset_id).first()
        emp = db.query(Employee).filter(Employee.id == r.reported_by).first()
        if ast and emp:
            results.append({
                "id": r.id,
                "asset_id": r.asset_id,
                "asset_name": ast.name,
                "asset_tag": ast.tag,
                "reported_by": r.reported_by,
                "reporter_name": emp.name,
                "issue_description": r.issue_description,
                "status": r.status,
                "technician_name": r.technician_name,
                "notes": r.notes,
                "created_at": r.created_at,
                "resolved_at": r.resolved_at
            })
    return results

@router.post("", response_model=MaintenanceResponse)
def create_maintenance_request(
    body: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Create a new maintenance request."""
    asset = db.query(Asset).filter(Asset.id == body.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    new_req = MaintenanceRequest(
        asset_id=body.asset_id,
        reported_by=current_user.id,
        issue_description=body.issue_description,
        notes=body.notes,
        created_at=datetime.now(timezone.utc),
        status=MaintenanceStatus.pending
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    
    return {
        "id": new_req.id,
        "asset_id": new_req.asset_id,
        "asset_name": asset.name,
        "asset_tag": asset.tag,
        "reported_by": new_req.reported_by,
        "reporter_name": current_user.name,
        "issue_description": new_req.issue_description,
        "status": new_req.status,
        "technician_name": new_req.technician_name,
        "notes": new_req.notes,
        "created_at": new_req.created_at,
        "resolved_at": new_req.resolved_at
    }

@router.patch("/{req_id}/status", response_model=MaintenanceResponse)
def update_maintenance_status(
    req_id: int,
    body: MaintenanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Update maintenance status via Kanban drag-drop."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
        
    asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Update asset status based on maintenance status
    if body.status == MaintenanceStatus.resolved:
        asset.status = AssetStatus.available
        req.resolved_at = datetime.now(timezone.utc)
    elif body.status in [MaintenanceStatus.approved, MaintenanceStatus.technician_assigned, MaintenanceStatus.in_progress]:
        asset.status = AssetStatus.maintenance
        req.resolved_at = None
    elif body.status == MaintenanceStatus.pending:
        # If moving back to pending, leave it available? 
        # The prompt says "Approving a card moves the asset to under maintenance, resolving return it to available"
        asset.status = AssetStatus.available
        req.resolved_at = None

    req.status = body.status
    if body.technician_name is not None:
        req.technician_name = body.technician_name
    if body.notes is not None:
        req.notes = body.notes

    db.commit()
    db.refresh(req)
    
    emp = db.query(Employee).filter(Employee.id == req.reported_by).first()
    
    return {
        "id": req.id,
        "asset_id": req.asset_id,
        "asset_name": asset.name,
        "asset_tag": asset.tag,
        "reported_by": req.reported_by,
        "reporter_name": emp.name if emp else "Unknown",
        "issue_description": req.issue_description,
        "status": req.status,
        "technician_name": req.technician_name,
        "notes": req.notes,
        "created_at": req.created_at,
        "resolved_at": req.resolved_at
    }
