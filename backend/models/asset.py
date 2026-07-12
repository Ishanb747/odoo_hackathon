"""
models/asset.py — Dev's model
Asset: the core entity everything else references
"""
import enum
from datetime import date
from sqlalchemy import String, Enum, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class AssetStatus(str, enum.Enum):
    available = "available"
    allocated = "allocated"
    maintenance = "maintenance"
    lost = "lost"


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    tag: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    serial_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("asset_categories.id"), nullable=True)
    status: Mapped[AssetStatus] = mapped_column(
        Enum(AssetStatus), default=AssetStatus.available, nullable=False, index=True
    )
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    acquisition_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    category: Mapped["AssetCategory | None"] = relationship("AssetCategory", back_populates="assets")  # noqa: F821
    department: Mapped["Department | None"] = relationship("Department", back_populates="assets")  # noqa: F821
    allocations: Mapped[list["Allocation"]] = relationship("Allocation", back_populates="asset")  # noqa: F821
    transfer_requests: Mapped[list["TransferRequest"]] = relationship("TransferRequest", back_populates="asset")  # noqa: F821
    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship("MaintenanceRequest", back_populates="asset")  # noqa: F821
    audit_records: Mapped[list["AuditRecord"]] = relationship("AuditRecord", back_populates="asset")  # noqa: F821
