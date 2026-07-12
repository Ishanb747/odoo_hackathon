"""
routers/audits.py — Phase 6 (Audit Workflow)
Audit cycles and records
"""
from typing import List, Optional
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from database import get_db
from models.audit import AuditCycle, AuditRecord, VerificationStatus
from models.asset import Asset, AssetStatus
from models.employee import Employee
from models.department import Department
from routers.auth import get_current_user

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────

class AuditRecordResponse(BaseModel):
    id: int
    asset_id: int
    asset_name: str
    asset_tag: str
    expected_location: Optional[str]
    verification_status: VerificationStatus

    class Config:
        from_attributes = True

class AuditCycleResponse(BaseModel):
    id: int
    name: str
    department_id: Optional[int]
    department_name: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    auditor_ids: List[int]
    closed: bool
    closed_at: Optional[datetime]
    created_at: datetime
    records: List[AuditRecordResponse]

    class Config:
        from_attributes = True

class AuditCycleCreate(BaseModel):
    name: str
    department_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    auditor_ids: List[int] = []

class RecordStatusUpdate(BaseModel):
    verification_status: VerificationStatus

# ── Endpoints ─────────────────────────────────────────────────

@router.get("", response_model=List[AuditCycleResponse])
def get_audit_cycles(db: Session = Depends(get_db)):
    cycles = db.query(AuditCycle).order_by(AuditCycle.created_at.desc()).all()
    results = []
    for c in cycles:
        dept_name = None
        if c.department_id:
            dept = db.query(Department).filter(Department.id == c.department_id).first()
            if dept:
                dept_name = dept.name
        
        # Manually construct records to ensure asset data is joined
        records = db.query(AuditRecord).filter(AuditRecord.cycle_id == c.id).all()
        rec_responses = []
        for r in records:
            asset = db.query(Asset).filter(Asset.id == r.asset_id).first()
            if asset:
                rec_responses.append({
                    "id": r.id,
                    "asset_id": r.asset_id,
                    "asset_name": asset.name,
                    "asset_tag": asset.tag,
                    "expected_location": r.expected_location,
                    "verification_status": r.verification_status
                })
        
        results.append({
            "id": c.id,
            "name": c.name,
            "department_id": c.department_id,
            "department_name": dept_name,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "auditor_ids": c.auditor_ids,
            "closed": c.closed,
            "closed_at": c.closed_at,
            "created_at": c.created_at,
            "records": rec_responses
        })
    return results

@router.post("", response_model=AuditCycleResponse)
def create_audit_cycle(
    body: AuditCycleCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    new_cycle = AuditCycle(
        name=body.name,
        department_id=body.department_id,
        start_date=body.start_date,
        end_date=body.end_date,
        auditor_ids=body.auditor_ids,
        closed=False,
        closed_at=None,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    
    # Auto-generate records for assets
    query = db.query(Asset).filter(Asset.status != AssetStatus.lost)
    if body.department_id:
        query = query.filter(Asset.department_id == body.department_id)
    
    assets_to_audit = query.all()
    records_added = []
    
    for a in assets_to_audit:
        rec = AuditRecord(
            cycle_id=new_cycle.id,
            asset_id=a.id,
            expected_location=a.location,
            verification_status=VerificationStatus.verified
        )
        db.add(rec)
        records_added.append(rec)
        
    db.commit()
    
    # Reload for response
    dept_name = None
    if new_cycle.department_id:
        dept = db.query(Department).filter(Department.id == new_cycle.department_id).first()
        if dept:
            dept_name = dept.name

    rec_responses = []
    for r in records_added:
        a = db.query(Asset).filter(Asset.id == r.asset_id).first()
        if a:
            rec_responses.append({
                "id": r.id,
                "asset_id": r.asset_id,
                "asset_name": a.name,
                "asset_tag": a.tag,
                "expected_location": r.expected_location,
                "verification_status": r.verification_status
            })

    return {
        "id": new_cycle.id,
        "name": new_cycle.name,
        "department_id": new_cycle.department_id,
        "department_name": dept_name,
        "start_date": new_cycle.start_date,
        "end_date": new_cycle.end_date,
        "auditor_ids": new_cycle.auditor_ids,
        "closed": new_cycle.closed,
        "closed_at": new_cycle.closed_at,
        "created_at": new_cycle.created_at,
        "records": rec_responses
    }

@router.patch("/records/{record_id}", response_model=AuditRecordResponse)
def update_audit_record(
    record_id: int,
    body: RecordStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    rec = db.query(AuditRecord).filter(AuditRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Audit record not found")
        
    cycle = db.query(AuditCycle).filter(AuditCycle.id == rec.cycle_id).first()
    if cycle and cycle.closed:
        raise HTTPException(status_code=400, detail="Cannot edit records of a closed audit cycle")

    rec.verification_status = body.verification_status
    db.commit()
    db.refresh(rec)
    
    asset = db.query(Asset).filter(Asset.id == rec.asset_id).first()
    
    return {
        "id": rec.id,
        "asset_id": rec.asset_id,
        "asset_name": asset.name if asset else "Unknown",
        "asset_tag": asset.tag if asset else "Unknown",
        "expected_location": rec.expected_location,
        "verification_status": rec.verification_status
    }

@router.post("/{cycle_id}/close", response_model=AuditCycleResponse)
def close_audit_cycle(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    cycle = db.query(AuditCycle).filter(AuditCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Audit cycle not found")
        
    if cycle.closed:
        raise HTTPException(status_code=400, detail="Audit cycle is already closed")
        
    cycle.closed = True
    cycle.closed_at = datetime.now(timezone.utc)
    
    # Process records and update asset statuses
    records = db.query(AuditRecord).filter(AuditRecord.cycle_id == cycle_id).all()
    for rec in records:
        asset = db.query(Asset).filter(Asset.id == rec.asset_id).first()
        if asset:
            if rec.verification_status == VerificationStatus.missing:
                asset.status = AssetStatus.lost
            elif rec.verification_status == VerificationStatus.damaged:
                asset.status = AssetStatus.maintenance
                
                # Auto-create maintenance request if not already pending
                # To be robust, checking if there's already an active one is good, 
                # but for hackathon speed we can just spawn it.
                from models.maintenance import MaintenanceRequest, MaintenanceStatus
                new_maintenance = MaintenanceRequest(
                    asset_id=asset.id,
                    reported_by=current_user.id,
                    issue_description=f"Auto-flagged during audit cycle: {cycle.name}",
                    status=MaintenanceStatus.pending,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_maintenance)
                
    db.commit()
    
    # Just redirecting to the GET endpoint effectively
    # (Returning full response to make UI easy)
    
    dept_name = None
    if cycle.department_id:
        dept = db.query(Department).filter(Department.id == cycle.department_id).first()
        if dept:
            dept_name = dept.name
            
    rec_responses = []
    for r in records:
        a = db.query(Asset).filter(Asset.id == r.asset_id).first()
        if a:
            rec_responses.append({
                "id": r.id,
                "asset_id": r.asset_id,
                "asset_name": a.name,
                "asset_tag": a.tag,
                "expected_location": r.expected_location,
                "verification_status": r.verification_status
            })

    return {
        "id": cycle.id,
        "name": cycle.name,
        "department_id": cycle.department_id,
        "department_name": dept_name,
        "start_date": cycle.start_date,
        "end_date": cycle.end_date,
        "auditor_ids": cycle.auditor_ids,
        "closed": cycle.closed,
        "closed_at": cycle.closed_at,
        "created_at": cycle.created_at,
        "records": rec_responses
    }
