"""
models/audit.py — Ishan's model (stub created in Phase 0)
AuditCycle + AuditRecord: Screen 8
"""
import enum
from datetime import date, datetime
from sqlalchemy import String, Enum, ForeignKey, Boolean, Date, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class VerificationStatus(str, enum.Enum):
    verified = "verified"
    missing = "missing"
    damaged = "damaged"


class AuditCycle(Base):
    __tablename__ = "audit_cycles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # auditor_ids stored as JSON array of employee IDs (simple for hackathon speed)
    auditor_ids: Mapped[list[int]] = mapped_column(JSON, default=list, nullable=False)
    closed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    records: Mapped[list["AuditRecord"]] = relationship("AuditRecord", back_populates="cycle")


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    cycle_id: Mapped[int] = mapped_column(ForeignKey("audit_cycles.id"), nullable=False, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    expected_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.verified, nullable=False
    )

    cycle: Mapped["AuditCycle"] = relationship("AuditCycle", back_populates="records")
    asset: Mapped["Asset"] = relationship("Asset", back_populates="audit_records")  # noqa: F821
