"""
routers/assets.py — Phase 2 (Dev)
Asset Registry: List, Filter, Register
"""
from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Asset, AssetCategory, Department, AssetStatus, Employee, EmployeeRole
from routers.auth import get_current_user

router = APIRouter()

# ── Pydantic Schemas ──────────────────────────────────────────

class AssetOut(BaseModel):
    id: int
    tag: str
    name: str
    serial_number: str | None
    category_id: int | None
    category_name: str | None
    status: AssetStatus
    location: str | None
    department_id: int | None
    department_name: str | None
    acquisition_date: date | None
    notes: str | None

    model_config = {"from_attributes": True}

class AssetCreate(BaseModel):
    tag: str
    name: str
    serial_number: str | None = None
    category_id: int | None = None
    status: AssetStatus = AssetStatus.available
    location: str | None = None
    department_id: int | None = None
    acquisition_date: date | None = None
    notes: str | None = None

# ── Helpers ───────────────────────────────────────────────────

def _asset_to_out(asset: Asset, db: Session) -> AssetOut:
    cat_name = None
    if asset.category_id:
        cat = db.get(AssetCategory, asset.category_id)
        cat_name = cat.name if cat else None

    dept_name = None
    if asset.department_id:
        dept = db.get(Department, asset.department_id)
        dept_name = dept.name if dept else None

    return AssetOut(
        id=asset.id,
        tag=asset.tag,
        name=asset.name,
        serial_number=asset.serial_number,
        category_id=asset.category_id,
        category_name=cat_name,
        status=asset.status,
        location=asset.location,
        department_id=asset.department_id,
        department_name=dept_name,
        acquisition_date=asset.acquisition_date,
        notes=asset.notes,
    )

# ── Endpoints ─────────────────────────────────────────────────

@router.get("", response_model=list[AssetOut])
def list_assets(
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user),
    search: str | None = Query(None, description="Search by tag, name, or serial"),
    category_id: int | None = Query(None),
    status: AssetStatus | None = Query(None),
    department_id: int | None = Query(None),
):
    query = db.query(Asset)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Asset.tag.ilike(search_filter),
                Asset.name.ilike(search_filter),
                Asset.serial_number.ilike(search_filter),
            )
        )
    
    if category_id is not None:
        query = query.filter(Asset.category_id == category_id)
        
    if status is not None:
        query = query.filter(Asset.status == status)
        
    if department_id is not None:
        query = query.filter(Asset.department_id == department_id)

    assets = query.order_by(Asset.id.desc()).all()
    return [_asset_to_out(asset, db) for asset in assets]


@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
def register_asset(
    body: AssetCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    # Only allow asset_manager, admin, or superadmin to create assets
    if current_user.role not in (EmployeeRole.asset_manager, EmployeeRole.admin, EmployeeRole.superadmin):
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Asset Manager or Admin privileges required to register assets"
        )

    # Check for existing tag
    existing = db.query(Asset).filter(Asset.tag == body.tag).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Asset tag already exists")

    asset = Asset(
        tag=body.tag,
        name=body.name,
        serial_number=body.serial_number,
        category_id=body.category_id,
        status=body.status,
        location=body.location,
        department_id=body.department_id,
        acquisition_date=body.acquisition_date,
        notes=body.notes,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _asset_to_out(asset, db)
