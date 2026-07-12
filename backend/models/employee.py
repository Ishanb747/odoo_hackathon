"""
models/employee.py — Dev's model
Employee / User entity: auth + role + department
"""
import enum
from sqlalchemy import String, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class EmployeeRole(str, enum.Enum):
    employee = "employee"
    asset_manager = "asset_manager"
    admin = "admin"
    superadmin = "superadmin"


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[EmployeeRole] = mapped_column(
        Enum(EmployeeRole), default=EmployeeRole.employee, nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"), nullable=True
    )

    # Relationships
    department: Mapped["Department | None"] = relationship(  # noqa: F821
        "Department",
        back_populates="employees",
        foreign_keys=[department_id],
    )
    allocations: Mapped[list["Allocation"]] = relationship(  # noqa: F821
        "Allocation", back_populates="employee"
    )
    bookings: Mapped[list["Booking"]] = relationship(  # noqa: F821
        "Booking", back_populates="employee"
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(  # noqa: F821
        "ActivityLog", back_populates="employee"
    )
