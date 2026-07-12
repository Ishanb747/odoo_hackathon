"""
seed.py — AssetFlow Phase 0 seed script
Populates the DB with sample data matching the mockup exactly:
  AF-0114 (Priya Shah), AF-0062, AF-0087, Room B2, etc.
Run: python seed.py
Idempotent: skips rows that already exist (checked by email/tag).
"""
from datetime import date, datetime, timezone

import bcrypt
from sqlalchemy.orm import Session

from database import engine, Base
from models import (
    Department, DeptStatus,
    Employee, EmployeeRole,
    AssetCategory,
    Asset, AssetStatus,
    Allocation,
    ActivityLog, LogType,
)

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def seed(db: Session) -> None:
    print("🌱 Seeding AssetFlow database...")

    # ── 1. Departments ─────────────────────────────────────────
    dept_data = [
        ("Engineering", DeptStatus.active),
        ("IT",          DeptStatus.active),
        ("Procurement", DeptStatus.active),
    ]
    depts: dict[str, Department] = {}
    for name, status in dept_data:
        existing = db.query(Department).filter_by(name=name).first()
        if not existing:
            d = Department(name=name, status=status)
            db.add(d)
            db.flush()
            depts[name] = d
        else:
            depts[name] = existing
    print(f"  ✓ {len(depts)} departments")

    # ── 2. Categories ──────────────────────────────────────────
    cat_data = [
        ("Laptops",    "Portable computing devices"),
        ("Projectors", "Display projection equipment"),
        ("Cameras",    "Photography and videography equipment"),
        ("Vehicles",   "Company vehicles and transport assets"),
        ("Rooms",      "Meeting rooms and shared spaces"),
    ]
    cats: dict[str, AssetCategory] = {}
    for name, desc in cat_data:
        existing = db.query(AssetCategory).filter_by(name=name).first()
        if not existing:
            c = AssetCategory(name=name, description=desc)
            db.add(c)
            db.flush()
            cats[name] = c
        else:
            cats[name] = existing
    print(f"  ✓ {len(cats)} categories")

    # ── 3. Employees ───────────────────────────────────────────
    emp_data = [
        # (name, email, password, role, dept_name)
        ("Admin",        "admin@assetflow.io",       "admin123",   EmployeeRole.admin,         None),
        ("Priya Shah",   "priya.shah@assetflow.io",  "password1",  EmployeeRole.employee,      "Engineering"),
        ("Arjun Nair",   "arjun.nair@assetflow.io",  "password1",  EmployeeRole.employee,      "Engineering"),
        ("Sneha Iyer",   "sneha.iyer@assetflow.io",  "password1",  EmployeeRole.asset_manager, "Engineering"),
        ("Rahul Mehta",  "rahul.mehta@assetflow.io", "password1",  EmployeeRole.employee,      "Engineering"),
        ("Divya Patel",  "divya.patel@assetflow.io", "password1",  EmployeeRole.employee,      "Engineering"),
        ("A. Rao",       "a.rao@assetflow.io",        "password1",  EmployeeRole.asset_manager, "IT"),
        ("S. Iqbal",     "s.iqbal@assetflow.io",      "password1",  EmployeeRole.employee,      "IT"),
        ("Karan Singh",  "karan.singh@assetflow.io", "password1",  EmployeeRole.employee,      "IT"),
        ("Meena Das",    "meena.das@assetflow.io",   "password1",  EmployeeRole.employee,      "IT"),
        ("Ravi Kumar",   "ravi.kumar@assetflow.io",  "password1",  EmployeeRole.employee,      "IT"),
        ("Anjali Roy",   "anjali.roy@assetflow.io",  "password1",  EmployeeRole.employee,      "Procurement"),
        ("Nikhil Joshi", "nikhil.joshi@assetflow.io","password1",  EmployeeRole.employee,      "Procurement"),
        ("Pooja Sharma", "pooja.sharma@assetflow.io","password1",  EmployeeRole.employee,      "Procurement"),
        ("Raj Kapoor",   "raj.kapoor@assetflow.io",  "password1",  EmployeeRole.asset_manager, "Procurement"),
    ]
    emps: dict[str, Employee] = {}
    for name, email, pw, role, dept_name in emp_data:
        existing = db.query(Employee).filter_by(email=email).first()
        if not existing:
            e = Employee(
                name=name,
                email=email,
                hashed_password=hash_password(pw),
                role=role,
                department_id=depts[dept_name].id if dept_name else None,
            )
            db.add(e)
            db.flush()
            emps[email] = e
        else:
            emps[email] = existing
    print(f"  ✓ {len(emps)} employees")

    # ── 4. Assets ─────────────────────────────────────────────
    asset_data = [
        # (tag, name, category, status, location, dept, acq_date, notes)
        ("AF-0114", "Dell Laptop",         "Laptops",    AssetStatus.allocated,    "Engineering Bay", "Engineering", date(2024, 1, 1),  "Allocated to Priya Shah"),
        ("AF-0115", "Dell Laptop",         "Laptops",    AssetStatus.available,    "IT Storeroom",    "IT",          date(2024, 1, 1),  None),
        ("AF-0116", "MacBook Pro",         "Laptops",    AssetStatus.available,    "IT Storeroom",    "IT",          date(2024, 3, 15), None),
        ("AF-0117", "ThinkPad X1",         "Laptops",    AssetStatus.allocated,    "Engineering Bay", "Engineering", date(2024, 2, 1),  None),
        ("AF-0118", "HP EliteBook",        "Laptops",    AssetStatus.available,    "Procurement",     "Procurement", date(2023, 11, 1), None),
        ("AF-0062", "Epson Projector",     "Projectors", AssetStatus.maintenance,  "Conference Room", "IT",          date(2023, 6, 1),  "Bulb not turning on"),
        ("AF-0063", "BenQ Projector",      "Projectors", AssetStatus.available,    "Room B2",         "IT",          date(2024, 1, 10), None),
        ("AF-0301", "Canon DSLR",          "Cameras",    AssetStatus.available,    "Media Room",      "Procurement", date(2022, 8, 1),  "Unused 60+ days"),
        ("AF-0302", "Sony Mirrorless",     "Cameras",    AssetStatus.available,    "Media Room",      "Procurement", date(2023, 3, 1),  None),
        ("AF-0087", "Toyota Forklift",     "Vehicles",   AssetStatus.available,    "Warehouse",       "Procurement", date(2021, 5, 1),  "Service due in 5 days"),
        ("AF-0088", "Honda Civic",         "Vehicles",   AssetStatus.allocated,    "Parking B",       "Procurement", date(2022, 2, 1),  None),
        ("AF-0089", "Mahindra Pickup",     "Vehicles",   AssetStatus.available,    "Parking A",       "Procurement", date(2020, 9, 1),  None),
        ("AF-0201", "Conference Room A1",  "Rooms",      AssetStatus.available,    "Floor 1",         "IT",          date(2019, 1, 1),  "Capacity: 10"),
        ("AF-0202", "Conference Room B2",  "Rooms",      AssetStatus.available,    "Floor 2",         "IT",          date(2019, 1, 1),  "Capacity: 15 — the Room B2 from the mockup"),
        ("AF-0203", "Meeting Pod C3",      "Rooms",      AssetStatus.available,    "Floor 3",         "IT",          date(2021, 6, 1),  "Capacity: 4"),
        ("AF-0119", "Lenovo IdeaPad",      "Laptops",    AssetStatus.available,    "IT Storeroom",    "IT",          date(2024, 4, 1),  None),
        ("AF-0120", "Dell Precision",      "Laptops",    AssetStatus.allocated,    "Engineering Bay", "Engineering", date(2024, 4, 1),  None),
        ("AF-0064", "ViewSonic Projector", "Projectors", AssetStatus.available,    "Training Room",   "IT",          date(2023, 9, 1),  None),
        ("AF-0303", "GoPro Hero",          "Cameras",    AssetStatus.available,    "Media Room",      "Procurement", date(2023, 5, 1),  None),
        ("AF-0090", "Tata Ace",            "Vehicles",   AssetStatus.available,    "Parking A",       "Procurement", date(2019, 12, 1), None),
    ]
    assets: dict[str, Asset] = {}
    for tag, name, cat_name, status, location, dept_name, acq_date, notes in asset_data:
        existing = db.query(Asset).filter_by(tag=tag).first()
        if not existing:
            a = Asset(
                tag=tag,
                name=name,
                category_id=cats[cat_name].id,
                status=status,
                location=location,
                department_id=depts[dept_name].id,
                acquisition_date=acq_date,
                notes=notes,
            )
            db.add(a)
            db.flush()
            assets[tag] = a
        else:
            assets[tag] = existing
    print(f"  ✓ {len(assets)} assets")

    # ── 5. Allocations ─────────────────────────────────────────
    priya = emps["priya.shah@assetflow.io"]
    arjun = emps["arjun.nair@assetflow.io"]
    af0114 = assets["AF-0114"]

    # Historical: Arjun held it first (returned Jan 04)
    hist = db.query(Allocation).filter_by(
        asset_id=af0114.id, employee_id=arjun.id
    ).first()
    if not hist:
        db.add(Allocation(
            asset_id=af0114.id,
            employee_id=arjun.id,
            allocated_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            returned_at=datetime(2024, 1, 4, tzinfo=timezone.utc),
            condition_on_return="good",
            notes="Jan 04 – Returned by Arjun Nair – condition: good",
        ))

    # Active: Priya currently holds it (Mar 12)
    active = db.query(Allocation).filter_by(
        asset_id=af0114.id, employee_id=priya.id, returned_at=None
    ).first()
    if not active:
        db.add(Allocation(
            asset_id=af0114.id,
            employee_id=priya.id,
            allocated_at=datetime(2024, 3, 12, tzinfo=timezone.utc),
            returned_at=None,
            notes="Mar 12 – Allocated to Priya Shah – Engineering",
        ))
    print("  ✓ allocations (AF-0114 → Priya Shah, history for Arjun Nair)")

    # ── 6. Activity log seed entries ──────────────────────────
    seed_logs = [
        (LogType.alert,    "Laptop AF-0114 – allocated to Priya Shah – IT dept",          priya.id),
        (LogType.approval, "Maintenance approved for AF-0062 – Epson Projector",           None),
        (LogType.booking,  "Room B2 booked – Procurement Team – 9:00 to 10:00",            None),
        (LogType.alert,    "3 assets overdue for return – flagged for follow-up",           None),
    ]
    for log_type, message, emp_id in seed_logs:
        existing = db.query(ActivityLog).filter_by(message=message).first()
        if not existing:
            db.add(ActivityLog(type=log_type, message=message, employee_id=emp_id))
    print("  ✓ activity log seed entries")

    db.commit()
    print("✅ Seed complete.")


if __name__ == "__main__":
    with Session(engine) as db:
        seed(db)
