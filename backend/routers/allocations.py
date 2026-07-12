"""
routers/allocations.py — Phase 4/5 (Long-Term Allocations)
Manage assigning assets to employees for the long term.
"""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.allocation import Allocation
from models.asset import Asset, AssetStatus
from models.employee import Employee
from routers.auth import get_current_user

router = APIRouter()

class AllocationCreate(BaseModel):
    asset_id: int
    employee_id: int
    notes: str | None = None

class AllocationResponse(BaseModel):
    id: int
    asset_id: int
    asset_name: str
    asset_tag: str
    employee_id: int
    employee_name: str
    allocated_at: datetime
    returned_at: datetime | None
    condition_on_return: str | None
    notes: str | None

    class Config:
        from_attributes = True

class AllocationReturn(BaseModel):
    condition_on_return: str
    needs_maintenance: bool = False

@router.get("", response_model=List[AllocationResponse])
def get_allocations(db: Session = Depends(get_db)):
    """Fetch all allocations (active and historical)."""
    allocs = db.query(Allocation).order_by(Allocation.allocated_at.desc()).all()
    results = []
    for a in allocs:
        ast = db.query(Asset).filter(Asset.id == a.asset_id).first()
        emp = db.query(Employee).filter(Employee.id == a.employee_id).first()
        if ast and emp:
            results.append({
                "id": a.id,
                "asset_id": a.asset_id,
                "asset_name": ast.name,
                "asset_tag": ast.tag,
                "employee_id": a.employee_id,
                "employee_name": emp.name,
                "allocated_at": a.allocated_at,
                "returned_at": a.returned_at,
                "condition_on_return": a.condition_on_return,
                "notes": a.notes
            })
    return results

@router.post("", response_model=AllocationResponse)
def create_allocation(
    body: AllocationCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Allocate an asset to an employee long-term."""
    # Ensure asset exists and is available
    asset = db.query(Asset).filter(Asset.id == body.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    if asset.status != AssetStatus.available:
        raise HTTPException(status_code=400, detail=f"Asset is not available (currently {asset.status.value})")
        
    # Ensure employee exists
    employee = db.query(Employee).filter(Employee.id == body.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update asset status
    asset.status = AssetStatus.allocated

    # Create allocation record
    new_alloc = Allocation(
        asset_id=body.asset_id,
        employee_id=body.employee_id,
        allocated_at=datetime.now(timezone.utc),
        notes=body.notes
    )
    db.add(new_alloc)
    db.commit()
    db.refresh(new_alloc)
    
    return {
        "id": new_alloc.id,
        "asset_id": new_alloc.asset_id,
        "asset_name": asset.name,
        "asset_tag": asset.tag,
        "employee_id": new_alloc.employee_id,
        "employee_name": employee.name,
        "allocated_at": new_alloc.allocated_at,
        "returned_at": None,
        "condition_on_return": None,
        "notes": new_alloc.notes
    }

@router.patch("/{alloc_id}/return", response_model=AllocationResponse)
def return_allocation(
    alloc_id: int,
    body: AllocationReturn,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Return an allocated asset."""
    alloc = db.query(Allocation).filter(Allocation.id == alloc_id).first()
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")
        
    if alloc.returned_at is not None:
        raise HTTPException(status_code=400, detail="Allocation is already returned")
        
    asset = db.query(Asset).filter(Asset.id == alloc.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Update allocation
    alloc.returned_at = datetime.now(timezone.utc)
    alloc.condition_on_return = body.condition_on_return

    # Update asset status
    if body.needs_maintenance:
        asset.status = AssetStatus.maintenance
    else:
        asset.status = AssetStatus.available

    db.commit()
    db.refresh(alloc)
    
    emp = db.query(Employee).filter(Employee.id == alloc.employee_id).first()
    
    return {
        "id": alloc.id,
        "asset_id": alloc.asset_id,
        "asset_name": asset.name,
        "asset_tag": asset.tag,
        "employee_id": alloc.employee_id,
        "employee_name": emp.name if emp else "Unknown",
        "allocated_at": alloc.allocated_at,
        "returned_at": alloc.returned_at,
        "condition_on_return": alloc.condition_on_return,
        "notes": alloc.notes
    }
