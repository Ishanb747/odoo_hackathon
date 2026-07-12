"""
models/department.py — Dev's model
Department entity: id, name, head, parent, status
"""
import enum
from sqlalchemy import String, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class DeptStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    head_employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id", use_alter=True, name="fk_dept_head"),
        nullable=True,
    )
    parent_dept_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"), nullable=True
    )
    status: Mapped[DeptStatus] = mapped_column(
        Enum(DeptStatus), default=DeptStatus.active, nullable=False
    )

    # Relationships (lazy="select" keeps it simple for a hackathon)
    employees: Mapped[list["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="department",
        foreign_keys="Employee.department_id",
    )
    parent: Mapped["Department | None"] = relationship(
        "Department", remote_side="Department.id"
    )
    assets: Mapped[list["Asset"]] = relationship(  # noqa: F821
        "Asset", back_populates="department"
    )
