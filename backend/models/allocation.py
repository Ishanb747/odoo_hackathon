"""
models/allocation.py — Dev's model
Allocation + TransferRequest: who holds what and pending transfers
"""
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class TransferStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Allocation(Base):
    """
    Active or historical record of asset ↔ employee assignment.
    returned_at=None means currently allocated.
    """
    __tablename__ = "allocations"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    returned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    condition_on_return: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="allocations")  # noqa: F821
    employee: Mapped["Employee"] = relationship("Employee", back_populates="allocations")  # noqa: F821


class TransferRequest(Base):
    """
    Transfer request when an asset is already allocated.
    Screen 5: from_employee → to_employee with a reason.
    """
    __tablename__ = "transfer_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    from_employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    to_employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TransferStatus] = mapped_column(
        Enum(TransferStatus), default=TransferStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    asset: Mapped["Asset"] = relationship("Asset", back_populates="transfer_requests")  # noqa: F821
    from_employee: Mapped["Employee"] = relationship("Employee", foreign_keys=[from_employee_id])  # noqa: F821
    to_employee: Mapped["Employee"] = relationship("Employee", foreign_keys=[to_employee_id])  # noqa: F821
