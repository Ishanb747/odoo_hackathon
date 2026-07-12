from typing import List, Optional
from datetime import date, time, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.booking import Booking, BookingStatus
from models.employee import Employee
from routers.auth import get_current_user

router = APIRouter()

class BookingBase(BaseModel):
    resource_name: str
    start_date: date
    end_date: date
    start_time: time
    end_time: time

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    employee_id: int
    employee_name: str
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True

class ResourceItemResponse(BaseModel):
    name: str
    category: str

@router.get("/resources", response_model=List[ResourceItemResponse])
def get_bookable_resources(db: Session = Depends(get_db)):
    """Fetch all unique resource names that can be booked (Rooms, Vehicles, Projectors) along with their categories."""
    from models.asset import Asset
    from models.category import AssetCategory
    assets = db.query(Asset, AssetCategory).join(AssetCategory).filter(
        AssetCategory.name.in_(["Rooms", "Vehicles", "Projectors"])
    ).all()
    
    unique_assets = {}
    for asset, category in assets:
        if asset.name not in unique_assets:
            unique_assets[asset.name] = category.name
            
    # Sort alphabetically by name
    return [{"name": name, "category": cat} for name, cat in sorted(unique_assets.items())]

@router.get("", response_model=List[BookingResponse])
def get_bookings(
    resource_name: Optional[str] = None,
    booking_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if resource_name:
        query = query.filter(Booking.resource_name == resource_name)
    if booking_date:
        query = query.filter(Booking.start_date <= booking_date, Booking.end_date >= booking_date)
    
    bookings = query.all()
    
    results = []
    for b in bookings:
        emp = db.query(Employee).filter(Employee.id == b.employee_id).first()
        results.append({
            "id": b.id,
            "resource_name": b.resource_name,
            "start_date": b.start_date,
            "end_date": b.end_date,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "employee_id": b.employee_id,
            "employee_name": emp.name if emp else "Unknown",
            "created_at": b.created_at
        })
    return results

@router.post("", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    if booking.start_date > booking.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")

    if booking.start_date == booking.end_date and booking.start_time >= booking.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time on the same day")
        
    # Check for conflicts (Overlapping date ranges AND overlapping times)
    # A conflict occurs if date ranges overlap AND time ranges overlap.
    overlapping = db.query(Booking).filter(
        Booking.resource_name == booking.resource_name,
        Booking.status == BookingStatus.confirmed,
        Booking.start_date <= booking.end_date,
        Booking.end_date >= booking.start_date,
        Booking.start_time < booking.end_time,
        Booking.end_time > booking.start_time
    ).first()

    if overlapping:
        emp = db.query(Employee).filter(Employee.id == overlapping.employee_id).first()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "conflict",
                "conflicting_booking": {
                    "id": overlapping.id,
                    "start_date": overlapping.start_date.isoformat(),
                    "end_date": overlapping.end_date.isoformat(),
                    "start_time": overlapping.start_time.isoformat(),
                    "end_time": overlapping.end_time.isoformat(),
                    "employee_name": emp.name if emp else "Unknown"
                }
            }
        )

    new_booking = Booking(
        resource_name=booking.resource_name,
        start_date=booking.start_date,
        end_date=booking.end_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        employee_id=current_user.id,
        status=BookingStatus.confirmed
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return {
        "id": new_booking.id,
        "resource_name": new_booking.resource_name,
        "start_date": new_booking.start_date,
        "end_date": new_booking.end_date,
        "start_time": new_booking.start_time,
        "end_time": new_booking.end_time,
        "status": new_booking.status,
        "employee_id": new_booking.employee_id,
        "employee_name": current_user.name,
        "created_at": new_booking.created_at
    }
