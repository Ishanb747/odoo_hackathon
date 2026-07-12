"""
models/__init__.py
Re-exports all models so Alembic env.py and main.py can do:
    from models import *   # pulls all Base metadata for autogenerate
"""
from .department import Department, DeptStatus
from .employee import Employee, EmployeeRole
from .category import AssetCategory
from .asset import Asset, AssetStatus
from .allocation import Allocation, TransferRequest, TransferStatus
from .booking import Booking, BookingStatus
from .maintenance import MaintenanceRequest, MaintenanceStatus
from .audit import AuditCycle, AuditRecord, VerificationStatus
from .notification import ActivityLog, LogType

__all__ = [
    "Department", "DeptStatus",
    "Employee", "EmployeeRole",
    "AssetCategory",
    "Asset", "AssetStatus",
    "Allocation", "TransferRequest", "TransferStatus",
    "Booking", "BookingStatus",
    "MaintenanceRequest", "MaintenanceStatus",
    "AuditCycle", "AuditRecord", "VerificationStatus",
    "ActivityLog", "LogType",
]
