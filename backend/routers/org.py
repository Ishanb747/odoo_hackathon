"""
routers/org.py — Phase 1 (Dev)
Organization Setup: Departments, Categories, Employees
All write operations require admin role.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import (
    AssetCategory,
    Department,
    DeptStatus,
    Employee,
    EmployeeRole,
)
from routers.auth import get_current_user, require_admin, require_superadmin

router = APIRouter()

# ── Helpers ───────────────────────────────────────────────────

def _dept_or_404(dept_id: int, db: Session) -> Department:
    dept = db.get(Department, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


def _cat_or_404(cat_id: int, db: Session) -> AssetCategory:
    cat = db.get(AssetCategory, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


def _emp_or_404(emp_id: int, db: Session) -> Employee:
    emp = db.get(Employee, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


# ═══════════════════════════════════════════════════════════════
# DEPARTMENTS
# ═══════════════════════════════════════════════════════════════

class DepartmentOut(BaseModel):
    id: int
    name: str
    head_employee_id: int | None
    head_name: str | None
    parent_dept_id: int | None
    parent_dept_name: str | None
    status: DeptStatus

    model_config = {"from_attributes": True}


class DepartmentCreate(BaseModel):
    name: str
    head_employee_id: int | None = None
    parent_dept_id: int | None = None
    status: DeptStatus = DeptStatus.active


class DepartmentUpdate(BaseModel):
    name: str | None = None
    head_employee_id: int | None = None
    parent_dept_id: int | None = None
    status: DeptStatus | None = None


def _dept_to_out(dept: Department, db: Session) -> DepartmentOut:
    head_name = None
    if dept.head_employee_id:
        head = db.get(Employee, dept.head_employee_id)
        head_name = head.name if head else None

    parent_name = None
    if dept.parent_dept_id:
        parent = db.get(Department, dept.parent_dept_id)
        parent_name = parent.name if parent else None

    return DepartmentOut(
        id=dept.id,
        name=dept.name,
        head_employee_id=dept.head_employee_id,
        head_name=head_name,
        parent_dept_id=dept.parent_dept_id,
        parent_dept_name=parent_name,
        status=dept.status,
    )


@router.get("/departments", response_model=list[DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user),
):
    """List all departments. Any authenticated user can read (for picklists)."""
    depts = db.query(Department).order_by(Department.name).all()
    return [_dept_to_out(d, db) for d in depts]


@router.post("/departments", response_model=DepartmentOut, status_code=201)
def create_department(
    body: DepartmentCreate,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    existing = db.query(Department).filter(Department.name == body.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Department name already exists")

    dept = Department(
        name=body.name,
        head_employee_id=body.head_employee_id,
        parent_dept_id=body.parent_dept_id,
        status=body.status,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return _dept_to_out(dept, db)


@router.patch("/departments/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    body: DepartmentUpdate,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    dept = _dept_or_404(dept_id, db)
    if body.name is not None:
        dept.name = body.name
    if body.head_employee_id is not None:
        dept.head_employee_id = body.head_employee_id
    if body.parent_dept_id is not None:
        dept.parent_dept_id = body.parent_dept_id
    if body.status is not None:
        dept.status = body.status
    db.commit()
    db.refresh(dept)
    return _dept_to_out(dept, db)


@router.delete("/departments/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    dept = _dept_or_404(dept_id, db)
    # Block deletion if employees are assigned
    if dept.employees:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete department with assigned employees. Reassign them first.",
        )
    if dept.assets:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete department with assigned assets. Reassign them first.",
        )
    db.delete(dept)
    db.commit()


# ═══════════════════════════════════════════════════════════════
# CATEGORIES
# ═══════════════════════════════════════════════════════════════

class CategoryOut(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user),
):
    """List all asset categories. Any authenticated user can read (for picklists)."""
    return db.query(AssetCategory).order_by(AssetCategory.name).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(
    body: CategoryCreate,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    existing = db.query(AssetCategory).filter(AssetCategory.name == body.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category name already exists")

    cat = AssetCategory(name=body.name, description=body.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch("/categories/{cat_id}", response_model=CategoryOut)
def update_category(
    cat_id: int,
    body: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    cat = _cat_or_404(cat_id, db)
    if body.name is not None:
        cat.name = body.name
    if body.description is not None:
        cat.description = body.description
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", status_code=204)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    cat = _cat_or_404(cat_id, db)
    if cat.assets:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete category with assigned assets. Reassign them first.",
        )
    db.delete(cat)
    db.commit()


# ═══════════════════════════════════════════════════════════════
# EMPLOYEES
# ═══════════════════════════════════════════════════════════════

class EmployeeOut(BaseModel):
    id: int
    name: str
    email: str
    role: EmployeeRole
    department_id: int | None
    department_name: str | None

    model_config = {"from_attributes": True}


class RoleUpdate(BaseModel):
    role: EmployeeRole


class DepartmentAssign(BaseModel):
    department_id: int | None


def _emp_to_out(emp: Employee, db: Session) -> EmployeeOut:
    dept_name = None
    if emp.department_id:
        dept = db.get(Department, emp.department_id)
        dept_name = dept.name if dept else None
    return EmployeeOut(
        id=emp.id,
        name=emp.name,
        email=emp.email,
        role=emp.role,
        department_id=emp.department_id,
        department_name=dept_name,
    )


@router.get("/employees", response_model=list[EmployeeOut])
def list_employees(
    db: Session = Depends(get_db),
    _: Employee = Depends(get_current_user),
):
    """List all employees with department and role info."""
    employees = db.query(Employee).order_by(Employee.name).all()
    return [_emp_to_out(e, db) for e in employees]


@router.patch("/employees/{emp_id}/role", response_model=EmployeeOut)
def update_employee_role(
    emp_id: int,
    body: RoleUpdate,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    """Promote or demote an employee's role. Admin only."""
    emp = _emp_or_404(emp_id, db)
    emp.role = body.role
    db.commit()
    db.refresh(emp)
    return _emp_to_out(emp, db)


@router.patch("/employees/{emp_id}/department", response_model=EmployeeOut)
def update_employee_department(
    emp_id: int,
    body: DepartmentAssign,
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_admin),
):
    """Reassign an employee to a different department. Admin only."""
    emp = _emp_or_404(emp_id, db)
    if body.department_id is not None:
        dept = db.get(Department, body.department_id)
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
    emp.department_id = body.department_id
    db.commit()
    db.refresh(emp)
    return _emp_to_out(emp, db)


@router.delete("/employees/{emp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    emp_id: int,
    db: Session = Depends(get_db),
    superadmin: Employee = Depends(require_superadmin),
):
    """Delete an employee. Superadmin only."""
    if emp_id == superadmin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    emp = _emp_or_404(emp_id, db)
    db.delete(emp)
    db.commit()
