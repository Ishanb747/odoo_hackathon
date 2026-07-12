# AssetFlow

**AssetFlow** is an Enterprise Asset & Resource Management System. It replaces spreadsheets and paper logs with a single system of record for tracking who holds what, where it is, its condition, shared-resource bookings, maintenance pipelines, and audit cycles.

## 🚀 Deployed Link
*Add your deployed URL here*
- **Frontend:** `https://odoo-hackathon-mu-eight.vercel.app/`
- **Backend API:** `https://odoo-hackathon-83vq.onrender.com/`

---

## 🏗 In-Detail Architecture

AssetFlow follows a modern, decoupled client-server architecture:

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **State Management & Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router DOM (v6)
- **Styling:** Pure CSS custom properties (variables) + CSS Modules for a lightweight, dependency-free, and sleek "Apple-like" UI.
- **Components:** Custom-built robust design system (Cards, Badges, Modals, Buttons) to avoid heavy UI library bloat.

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database ORM:** SQLAlchemy 2.0
- **Database:** SQLite (dev) / PostgreSQL (production-ready)
- **Migrations:** Alembic
- **Authentication:** JWT (JSON Web Tokens) with hashed passwords
- **Validation:** Pydantic models for strict type-checking of all requests and responses

### System Architecture Diagram

```mermaid
graph TD
    subgraph Client [Frontend App]
        UI[React UI Components]
        State[TanStack Query Cache]
        API_Client[Fetch API Layer]
        
        UI --> State
        State --> API_Client
    end

    subgraph Server [FastAPI Backend]
        Router[API Routers]
        Auth[JWT Auth Middleware]
        Logic[Business Logic / Services]
        ORM[SQLAlchemy ORM]
        
        Router --> Auth
        Auth --> Logic
        Logic --> ORM
    end

    subgraph DB [Database]
        Postgres[(PostgreSQL / SQLite)]
    end

    API_Client -- "REST API (JSON over HTTP)" --> Router
    ORM --> Postgres
```

---

## 📊 In-Detail Data Diagram

AssetFlow's relational database schema is designed for complete lifecycle tracking, from initial registration to allocation, maintenance, auditing, and eventual retirement.

```mermaid
erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : employs
    DEPARTMENT ||--o{ ASSET : owns
    DEPARTMENT ||--o{ AUDIT_CYCLE : scopes

    CATEGORY ||--o{ ASSET : categorizes

    EMPLOYEE ||--o{ ALLOCATION : holds
    EMPLOYEE ||--o{ TRANSFER_REQUEST : "requests (from/to)"
    EMPLOYEE ||--o{ BOOKING : books
    EMPLOYEE ||--o{ MAINTENANCE_REQUEST : reports
    EMPLOYEE ||--o{ ACTIVITY_LOG : receives

    ASSET ||--o{ ALLOCATION : "is allocated"
    ASSET ||--o{ TRANSFER_REQUEST : "is transferred"
    ASSET ||--o{ MAINTENANCE_REQUEST : "needs"
    ASSET ||--o{ AUDIT_RECORD : "is audited"

    AUDIT_CYCLE ||--o{ AUDIT_RECORD : contains

    DEPARTMENT {
        int id PK
        string name
        boolean active
    }
    CATEGORY {
        int id PK
        string name
        string description
    }
    EMPLOYEE {
        int id PK
        string name
        string email
        string role
        int department_id FK
    }
    ASSET {
        int id PK
        string tag
        string name
        string status
        date acquisition_date
        int category_id FK
        int department_id FK
    }
    ALLOCATION {
        int id PK
        date allocated_at
        date returned_at
        int asset_id FK
        int employee_id FK
    }
    TRANSFER_REQUEST {
        int id PK
        string reason
        string status
        int asset_id FK
        int from_employee_id FK
        int to_employee_id FK
    }
    BOOKING {
        int id PK
        string resource_name
        date start_date
        time start_time
        string status
        int employee_id FK
    }
    MAINTENANCE_REQUEST {
        int id PK
        string issue_description
        string status
        int asset_id FK
        int reported_by FK
        int technician_id FK
    }
    AUDIT_CYCLE {
        int id PK
        string name
        date start_date
        date end_date
        boolean closed
        datetime closed_at
        int department_id FK
    }
    AUDIT_RECORD {
        int id PK
        string expected_location
        string verification_status
        int cycle_id FK
        int asset_id FK
    }
    ACTIVITY_LOG {
        int id PK
        string type
        string message
        boolean read
        int employee_id FK
    }
```

---

## ✨ Features & Phases

AssetFlow was built iteratively across 7 major phases to ensure isolated, testable vertical slices.

### Phase 1: Identity & Org Setup
- Secure JWT-based authentication.
- Admin dashboard to manage Departments, Categories, and the Employee directory.
- Role-based access control (Admin, Asset Manager, Technician, Employee).

### Phase 2: Asset Registry
- Comprehensive asset directory with advanced filtering (by Category, Status, Department).
- Tracking of core asset metadata (Tags, Serial Numbers, Purchase Dates).

### Phase 3: Allocation & Transfer
- System of record for assigning assets to specific employees.
- Conflict detection: Prevents double-allocation natively.
- Peer-to-peer Transfer Request workflows for exchanging assets directly.

### Phase 4: Resource Booking
- Reservation system for communal resources (e.g., Conference Rooms, Projectors).
- Visual timeline collision detection (prevents overlapping bookings).

### Phase 5: Maintenance Workflow
- Drag-and-drop Kanban board for the IT/Facilities teams.
- Tracks tickets through `Pending` → `Approved` → `In Progress` → `Resolved`.
- Automatically locks associated assets to `Under Maintenance` status when approved.

### Phase 6: Audit Cycles
- Automated bulk auditing campaigns for specific departments.
- 3-state verification (Verified, Missing, Damaged).
- Closing an audit cycle automatically marks missing assets as `Lost` and spawns Maintenance tickets for `Damaged` assets.

### Phase 7: Reports & Analytics
- Live 3x2 interactive dashboard.
- Features: Inventory Status, Department Utilization, Maintenance Pipeline funnels, and Audit Match Rate gauges.
- Unified "Activity & Notifications" feed that aggregates system events into an actionable inbox.

---

## 🤝 Team Work Split

To ensure a smooth hackathon build without merge conflicts, the workload was split into two isolated **vertical slices** (each owner built the DB models, API endpoints, and React UI for their assigned screens):

| | **Dev** <br>*(Core Registry & Identity)* | **Ishan** <br>*(Operational Workflows & Insight)* |
|---|---|---|
| **Core Screens** | Login, Org Setup, Assets Directory, Allocation & Transfer | Landing Page, Resource Booking, Maintenance Kanban, Audit Cycles |
| **Phase 7 Split** | Dashboard | Reports Dashboard + Notifications/Activity Feed |
| **Why this split?** | Owns the core entities (Employees, Departments, Assets) that everything else depends on. | Owns the workflows that consume the registry, plus complex frontend features like Kanban Drag-and-Drop and Charts. |
