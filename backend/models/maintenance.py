"""
models/maintenance.py — Ishan's model (stub created in Phase 0)
MaintenanceRequest: Screen 7 Kanban
"""
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class MaintenanceStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    technician_assigned = "technician_assigned"
    in_progress = "in_progress"
    resolved = "resolved"


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    reported_by: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[MaintenanceStatus] = mapped_column(
        Enum(MaintenanceStatus), default=MaintenanceStatus.pending, nullable=False, index=True
    )
    technician_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="maintenance_requests")  # noqa: F821
