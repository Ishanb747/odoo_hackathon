"""
models/notification.py — Ishan's model (stub created in Phase 0)
ActivityLog: unified feed for Screen 10 (notifications + activity)
One table, type field drives the All/Alerts/Approvals/Bookings tab filter.
"""
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, Boolean, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class LogType(str, enum.Enum):
    alert = "alert"
    approval = "approval"
    booking = "booking"
    transfer = "transfer"
    audit = "audit"
    maintenance = "maintenance"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[LogType] = mapped_column(Enum(LogType), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    employee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    employee: Mapped["Employee | None"] = relationship("Employee", back_populates="activity_logs")  # noqa: F821
