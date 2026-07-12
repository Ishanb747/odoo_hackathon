"""
routers/allocations.py — Phase 3
Asset Allocation and Transfer flows
"""
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Asset, AssetStatus, Employee, EmployeeRole, Department,
    Allocation, TransferRequest, TransferStatus,
    ActivityLog, LogType
)
from routers.auth import get_current_user

router = APIRouter()

# ── Pydantic Schemas ──────────────────────────────────────────

class AllocationHistoryOut(BaseModel):
    id: int
    allocated_to: str
    department: str | None
    allocated_at: datetime
    returned_at: datetime | None
    notes: str | None
    condition_on_return: str | None

class AllocationStateOut(BaseModel):
    asset_id: int
    is_allocated: bool
    current_allocation: AllocationHistoryOut | None
    history: list[AllocationHistoryOut]

class AllocationCreate(BaseModel):
    asset_id: int
    employee_id: int
    notes: str | None = None

class TransferRequestCreate(BaseModel):
    asset_id: int
    to_employee_id: int
    reason: str | None = None

class AllocationOut(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    allocated_at: datetime
    notes: str | None

class TransferRequestOut(BaseModel):
    id: int
    asset_id: int
    from_employee_id: int
    to_employee_id: int
    status: str
    reason: str | None
    created_at: datetime

# ── Helpers ───────────────────────────────────────────────────

def _allocation_to_history(alloc: Allocation, db: Session) -> AllocationHistoryOut:
    employee = db.get(Employee, alloc.employee_id)
    emp_name = employee.name if employee else "Unknown"
    dept_name = None
    if employee and employee.department_id:
        dept = db.get(Department, employee.department_id)
        if dept:
            dept_name = dept.name
            
    return AllocationHistoryOut(
        id=alloc.id,
        allocated_to=emp_name,
        department=dept_name,
        allocated_at=alloc.allocated_at,
        returned_at=alloc.returned_at,
        notes=alloc.notes,
        condition_on_return=alloc.condition_on_return
    )

# ── Endpoints ─────────────────────────────────────────────────

@router.get("/{asset_id}", response_model=AllocationStateOut)
def get_allocation_state(
    asset_id: int,
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user)
):
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    allocations = db.query(Allocation).filter(Allocation.asset_id == asset_id).order_by(Allocation.allocated_at.desc()).all()
    
    current_allocation = None
    history = []
    
    for alloc in allocations:
        history_out = _allocation_to_history(alloc, db)
        history.append(history_out)
        if alloc.returned_at is None:
            current_allocation = history_out

    return AllocationStateOut(
        asset_id=asset_id,
        is_allocated=current_allocation is not None,
        current_allocation=current_allocation,
        history=history
    )

@router.post("", response_model=AllocationOut, status_code=status.HTTP_201_CREATED)
def allocate_asset(
    body: AllocationCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Check permissions
    if current_user.role not in (EmployeeRole.asset_manager, EmployeeRole.admin, EmployeeRole.superadmin):
        raise HTTPException(status_code=403, detail="Asset Manager privileges required")

    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Check conflict
    active_alloc = db.query(Allocation).filter(
        Allocation.asset_id == body.asset_id,
        Allocation.returned_at == None
    ).first()
    
    if active_alloc or asset.status != AssetStatus.available:
        raise HTTPException(status_code=409, detail="Asset is already allocated or unavailable")

    employee = db.get(Employee, body.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Create allocation
    new_alloc = Allocation(
        asset_id=body.asset_id,
        employee_id=body.employee_id,
        notes=body.notes
    )
    db.add(new_alloc)
    
    # Update asset status
    asset.status = AssetStatus.allocated
    
    # Activity Log
    emp_dept = db.get(Department, employee.department_id).name if employee.department_id else "Unknown"
    log = ActivityLog(
        type=LogType.alert,
        message=f"{asset.category.name if asset.category else 'Asset'} {asset.tag} – allocated to {employee.name} – {emp_dept} dept",
        employee_id=employee.id
    )
    db.add(log)
    
    db.commit()
    db.refresh(new_alloc)
    
    return AllocationOut(
        id=new_alloc.id,
        asset_id=new_alloc.asset_id,
        employee_id=new_alloc.employee_id,
        allocated_at=new_alloc.allocated_at,
        notes=new_alloc.notes
    )

@router.post("/transfer", response_model=TransferRequestOut, status_code=status.HTTP_201_CREATED)
def request_transfer(
    body: TransferRequestCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Ensure it's currently allocated
    active_alloc = db.query(Allocation).filter(
        Allocation.asset_id == body.asset_id,
        Allocation.returned_at == None
    ).first()
    
    if not active_alloc:
        raise HTTPException(status_code=400, detail="Asset is not currently allocated, cannot request transfer")

    # Create transfer request
    transfer = TransferRequest(
        asset_id=body.asset_id,
        from_employee_id=active_alloc.employee_id,
        to_employee_id=body.to_employee_id,
        reason=body.reason
    )
    db.add(transfer)
    
    # Activity Log
    log = ActivityLog(
        type=LogType.alert,
        message=f"Transfer requested for {asset.tag} – from {db.get(Employee, active_alloc.employee_id).name} to {db.get(Employee, body.to_employee_id).name}",
        employee_id=current_user.id
    )
    db.add(log)
    
    db.commit()
    db.refresh(transfer)
    
    return TransferRequestOut(
        id=transfer.id,
        asset_id=transfer.asset_id,
        from_employee_id=transfer.from_employee_id,
        to_employee_id=transfer.to_employee_id,
        status=transfer.status.value,
        reason=transfer.reason,
        created_at=transfer.created_at
    )
