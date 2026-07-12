# AssetFlow — Build Plan & Scaffolding Guide

> Enterprise Asset & Resource Management System — hackathon build plan, rebuilt against the actual Excalidraw mockup (all 10 screens + login). No application code here — this is the map, not the build.

**On the mockup vs. the "cute cartoonish" brief:** the mockup is a low-fi Excalidraw wireframe — black canvas, hand-drawn white outlines. That's Excalidraw's default sketch style, not a stated dark-mode intent, so I'm treating it as **structure only** (nav, layout, fields, tables, what's on each screen) and still applying the warm/cute/professional design tokens from the original brief on top of it for the real build. Flag it if you actually want the shipped app to stay dark/sketch-styled instead.

---

## 0. Initial setup (do this first, both of you together)

1. **Prerequisites:** Node 20+, Python 3.11+, `npm` or `pnpm`, `git`. Agree on one package manager before anyone runs an install — mixed lockfiles are the #1 avoidable merge conflict.
2. **Repo:** one shared repo, two-folder layout — `/frontend` (Vite + React + TS) and `/backend` (FastAPI). Create it, push an empty commit, both clone before writing anything.
3. **Branch model:** `main` stays deployable. Work happens on `phase-<n>-<name>` branches (e.g. `phase-1-dev`, `phase-4-ishan`), PR'd back into `main` at the end of each phase — see Section 8's sync points for why phase-boundaries matter more than per-person branches.
4. **Backend bootstrap:** virtualenv, install deps, copy `.env.example` → `.env` (DB URL, JWT secret), run migrations, run the seed script (Section 7, Phase 0 — Dev's half) so both of you are developing against the same sample data (`AF-0114`, Priya Shah, Room B2, etc. — matching the mockup).
5. **Frontend bootstrap:** install deps, copy `.env.example` → `.env` (API base URL), confirm the dev server proxies API calls to the backend port.
6. **First commit each:** Dev commits the DB schema + seed; Ishan commits the design tokens + shared component shell (Section 3) and the landing page (Screen 0, below). Everything after this point follows the vertical-slice split in Section 8.
7. **Checklist before Phase 1 starts:** backend boots and returns seed data on a health-check route; frontend boots and renders the shared shell with real tokens (not placeholder Tailwind defaults); both of you can log in as the seeded admin.

---

## 1. Vision recap

AssetFlow replaces spreadsheets and paper logs with one system of record for **who holds what, where it is, and its condition** — asset lifecycle, allocation, shared-resource booking, maintenance approval, and audit cycles. Core ERP only: no purchasing/invoicing/accounting.

---

## 2. Global structure (confirmed from mockup)

**Sidebar nav — identical on every screen, in this exact order:**
`Dashboard → Organization setup → Assets → Allocation & Transfer → Resource Booking → Maintenance → Audit → Reports → Notifications`

Two things this confirms that my first draft got wrong:
- **Categories and Employee Directory are not separate nav items** — they're tabs inside *Organization setup*, alongside *Departments* (`Departments | Categories | Employee | +Add` as a tab/button row at the top of that screen's content pane).
- Nav is flat, 9 items, no grouping/collapsing shown.

**Header pattern:** every screen keeps `AssetFlow` as a static wordmark top-left of the content card. Login and the new Landing page (Screen 0, added below — not in the original mockup) are the two screens with no sidebar; everything from Dashboard onward uses the shell.

---

## 3. Design direction — "cute, cartoonish, professional" (unchanged from brief, applied over the mockup's structure)

| Role | Value | Notes |
|---|---|---|
| Canvas | `#FAF6F0` | warm paper |
| Ink | `#221F2E` | near-black plum |
| Primary — Periwinkle | `#6C63FF` | nav, primary actions, links |
| Accent — Sunshine | `#FFB84C` | CTAs, quick actions |
| Success — Mint | `#46C38F` | Available / Verified / Resolved / Active |
| Danger — Coral | `#FF6B6B` | Overdue / Missing / Blocked / conflict states |
| Warning — Amber | `#E8A33D` | Damaged / at-risk states (Audit screen needs a 3rd status color beyond mint/coral) |
| Surface | `#FFFFFF` on `#ECE7DE` border | cards, tables |

**Type:** Fredoka (display/KPI numbers) + Plus Jakarta Sans (body/UI) + JetBrains Mono (asset tags like `AF-0114`, serials).

**Mascot ("Dex," a rounded dolly/trolley character):** login screen only, plus empty states — the mockup's screens are all populated with seed-like data, so there's no explicit empty-state slot in the wireframe; that's a build-time addition, not something the mockup shows.

**Status pill vocabulary — now fully enumerated from the mockup itself**, not guessed:
- Department status: `Active` / `Inactive`
- Asset status: `Available` / `Allocated` / `Maintenance` (shown as label; PS calls it "Under Maintenance")
- Audit result: `Verified` (mint) / `Missing` (coral) / `Damaged` (amber — new, see above)
- Booking conflict state: a dotted-outline coral box distinct from the solid "booked" block — i.e. conflict is a *visual diff*, not just a rejection toast

### Common CSS — single source of truth

Pills, cards, and buttons appear on nearly every screen and are split across both people's work (Dev's Department/Asset tables, Ishan's Audit/Booking/Kanban cards) — this is the single most likely place a hackathon demo looks inconsistent if it's not centralized. So:

- **One file**, `styles/tokens.css`, holding every value from the palette table above as a CSS custom property (`--color-canvas`, `--color-primary`, `--color-danger`, `--radius-card`, `--font-display`, etc.) plus a spacing scale. Built once, in Phase 0, by Ishan (Section 7/8).
- Tailwind config **extends** its theme from these variables — nobody writes a raw hex value or an arbitrary Tailwind value (`bg-[#6C63FF]`) in a component, ever. If a color is needed that isn't a token, that's a conversation, not a one-off value.
- **Shared primitives, not per-screen reinventions:** one `Badge` component/class for every status pill (`.badge-success`, `.badge-danger`, `.badge-warning`, `.badge-neutral`), one `Card` style for every panel, one `Button` with `primary`/`secondary`/`ghost` variants. Built once alongside the tokens, then frozen — same rule as the shared component shell in Section 8.
- Practical effect: Dev's "Active" pill and Ishan's "Verified" pill should be styleable as `<Badge tone="success">` in both people's code, not two different green boxes that happen to look similar.

---

## 4. Screen-by-screen spec (from mockup, this is now the source of truth over the PS prose)

### Screen 0 — Landing page (not in the mockup — added per request for a clean public entry point)
Not part of the app shell, no sidebar, single scroll, public/unauthenticated:
- **Hero:** `AssetFlow` wordmark, one-line promise ("Know where everything is — instantly."), Dex mascot as a friendly hero illustration rather than a tucked-away detail, two CTAs: `Get started` (→ signup) as primary/sunshine button, `Log in` as secondary/ghost button
- **What it does**, 4 short cards, one per core capability, plain language not feature-speak: track assets, book shared resources, approve maintenance, run audits — each a one-line description, no marketing fluff
- **Trust strip (optional, cut first if short on time):** a single line like "Built for teams with equipment, rooms, or vehicles to track" — no fake logos/testimonials, this is a hackathon demo not a funded product
- **Footer:** wordmark + `Log in` link, nothing else — this page's only job is getting someone to Login or Signup in under 10 seconds, not explaining the whole product
- **Design rule specific to this screen:** it's the one place "cute" can lead over "professional" — Dex gets the most visual real estate here of anywhere in the app, since it's the lowest-stakes, most marketing-flavored screen. Every other screen (Section 3) keeps Dex to a single small appearance at most.

### Login (no sidebar)
Centered card: `AssetFlow – login` title, circular `AF` avatar mark, Email field, Password field, `Forgot password` link (right-aligned under password), divider, "New here?" label, static helper copy confirming signup creates an employee account only, `Create Account` button.

### Screen 2 — Dashboard
- Header: "Today's Overview"
- KPI cards, 2 rows of 3:
  - Row 1: **Available** (128), **Allocated** (76), third card labeled "Available 4" in the sketch — this is almost certainly a mislabel for **Maintenance Today** per the PS's own KPI list (Assets Available / Assets Allocated / Maintenance Today / Active Bookings / Pending Transfers / Upcoming Returns). Building as *Maintenance Today* — flag if that's wrong.
  - Row 2: **Active Bookings** (9), **Pending Transfers** (3), **Upcoming Returns** (12)
- Coral alert banner, full width under the KPI grid: "3 assets overdue for return – flagged for follow-up" (this is a distinct element from the KPI cards, not a restyled card)
- Quick action row: `+ register asset`, `Book resource`, `Raise requests`
- "Recent Activity" section below: plain timestamped text lines (not cards), e.g. "Laptop AF-0114 – allocated to Priya Shah – IT dept"

### Screen 3 — Organization setup (Admin only)
- Tab/button row at top of content: `Departments | Categories | Employee | + Add`
- Departments tab (the one drawn): table with `Department | Head | Parent Dept | Status` columns, status as pill (`Active`/`Inactive`), `Parent Dept` shows `—` when there's no parent (hierarchy is flat-displayed, not indented/tree-drawn)
- Footer note baked into the screen itself: "Editing a department here also drives the picklist in Screen 4 & 5" — i.e. department edits must propagate live to Asset Directory filters and Allocation forms, this is explicitly called out as a dependency, not incidental

### Screen 4 — Asset registrations and directory
- Search bar: "Search by tag, serial, or QR code.." + `+ Register Asset` button, same row
- Filter row directly below: `Category`, `Status`, `Department` dropdowns (three filters only in the sketch — location/serial-specific filters mentioned in the PS aren't drawn as separate controls, likely folded into the search bar)
- Table: `Tag | Name | Category | Status | Location`

### Screen 5 — Asset Allocation & Transfer (double-allocation block in action)
- Asset picker at top: e.g. "AF-0114 – Dell laptop"
- **Conflict block**, coral, appears immediately below asset picker when already allocated: "Already Allocated to Priya Shah (Engineering) / Direct re-allocation is blocked – submit a transfer request below" — this is the literal PS example, confirmed pixel-for-pixel
- Transfer Request form directly under the conflict block: `From` (prefilled, read-only-looking), `To` (Select Employee dropdown), `Reason` (textarea), `Submit Request` button
- "Allocation history" section below the form: plain text log, e.g. "Mar 12 – Allocated to Priya Shah – Engineering" / "Jan 04 – Returned by Arjun Nair – condition: good"
- **Note:** the mockup shows the transfer form as always-visible once conflict is hit — there's no separate "unblocked" allocation form drawn, so a first-time (non-conflicting) allocation screen state needs to be designed by extension, not copied from the sketch.

### Screen 6 — Resource Booking
- Resource picker: "Conference room B2 – Tue, 7 Jul" (resource + date combined in one field)
- Vertical time-slot list (9:00, 10:00, 11:00, 12:00, 1:00 shown)
- Existing booking rendered as a **solid blue block** spanning its time range: "Booked – Procurement Team – 9 to 10"
- Conflict rendered as a **dotted coral outline box** overlapping the solid block: "Requested 9:30 to 10:30 – conflict – slot is unavailble" — confirms conflict needs its own visual treatment layered on the calendar, not just a rejected toast
- `Book a slot` button at the bottom

### Screen 7 — Maintenance Management
- **Kanban board**, not a list/table: columns `Pending | Approved | Technician assigned | In progress | Resolved`
- Cards carry asset tag + name + short issue string, e.g. "AF-0062 Projector bulb not turning on"; later columns show extra context inline on the card (technician name in "Technician assigned," "parts ordered" in "In progress," resolution date in "Resolved")
- Footer note on the screen itself: "Approving a card moves the asset to under maintenance, resolving return it to available" — i.e. this is meant to be **drag-and-drop**, and the column transition is what triggers the status change on the asset, confirming the workflow direction from the PS but specifying the *interaction model* (drag card between columns) that the PS text alone didn't specify.

### Screen 8 — Asset Audit
- Header box: cycle name + scope + date range + assigned auditors as one block, e.g. "Q3 audit: Engineering dept – 1–15 Jul / Auditors: A. Rao, S. Iqbal"
- Table: `Asset | Expected location | Verification`, verification as a 3-state pill: `Verified` (mint) / `Missing` (coral) / `Damaged` (amber)
- Alert bar: "2 assets flagged – discrepancy report generated automatically" — auto-generated and auto-counted, confirms this must be computed, not a manual admin action
- `Close audit cycle` button

### Screen 9 — Reports & Analytics
- Two chart cards side by side at the top: **"Utilization by department"** (bar chart) and **"Maintenance Frequency"** (line chart)
- Below: two side-by-side text lists, **"Most used assets"** (e.g. "Room B2: 34 bookings this month") and **"Idle assets"** (e.g. "Camera AF-0301: unused 60+ days")
- Below that: **"Assets due for maintenance / nearing retirement"** list (e.g. "Forklift AF-0087: service due in 5 days")
- `Export report` button at the bottom
- Note: the PS's "department-wise allocation summary" and "booking heatmap" aren't distinctly drawn — the two charts shown (utilization, maintenance frequency) plus the three list sections appear to be the full scope of this screen; heatmap may be a stretch add if time allows, not core to the mockup.

### Screen 10 — Activity Logs & Notifications
- Filter tab row: `All | Alerts | Approvals | Bookings`
- List of items, each with a checkbox (mark-as-read affordance), message text, and relative timestamp (e.g. "2m ago," "1d ago")
- Message examples confirm the notification vocabulary from the PS almost verbatim: asset assigned, maintenance approved, booking confirmed, transfer approved, overdue return, audit discrepancy flagged
- **This screen doubles as both the notification feed and the activity log** in the mockup — they're not drawn as two separate screens/tabs, just filtered by the same tab row. Simplifies Phase 7 below: one feed, one filter row, not two separate builds.

---

## 5. Recommended stack (unchanged assumption — confirm or swap)

- **Frontend:** React + TypeScript + Vite, Tailwind (tokens above as CSS variables), React Router, TanStack Query
- **Backend:** Python + FastAPI, SQLAlchemy, Pydantic, JWT auth
- **DB:** SQLite for hackathon speed → swappable to Postgres
- **Kanban (Screen 7):** needs a drag-and-drop lib (e.g. `@dnd-kit/core`) — the mockup's footer note makes drag-and-drop a functional requirement, not a nice-to-have
- Polling every 30s for dashboard/notification freshness is enough; skip websockets unless time allows

---

## 6. Core entities (schema shape, not code)

`Department`, `Employee(User)`, `AssetCategory`, `Asset`, `Allocation`, `TransferRequest`, `Booking`, `MaintenanceRequest`, `AuditCycle` → `AuditAssignment` → `AuditRecord`, `Notification`/`ActivityLog` (can now be **one table**, per Screen 10 above, distinguished by a `type` field the tab filter reads).

Key rule confirmed by Screen 5: allocation conflict is checked **before** the transfer form even renders — the API needs a "can I allocate this?" check that returns the current holder, not just a blanket 409.

---

## 7. Build phases

> Owner tags below assume the two-person split in **Section 8**. Read that section first if you're dividing work.

### Phase 0 — Foundations (½–1 day) — **Dev + Ishan, split in half**
- Repo scaffold, DB schema + migrations, seed script (2–3 departments, 5 categories, 15 employees, 20 assets — enough to match the mockup's own sample data like `AF-0114`, `Priya Shah`, `Room B2`)
- Design tokens wired into Tailwind; sidebar shell (the 9-item nav) built once and reused across every screen; Dex mascot component

**Done when:** the 9-item sidebar + `AssetFlow` header shell renders identically on a blank page for every route.

### Phase 1 — Identity & Org Setup (Login, Screen 3) — **Dev**  |  Landing page (Screen 0) — **Ishan, in parallel**
- Login/signup exactly per the login card layout (avatar mark, forgot password, signup-is-employee-only helper text)
- Org Setup as a **tabbed screen**: Departments tab (table as specced), Categories tab, Employee tab, `+Add` — role promotion happens only in the Employee tab
- In parallel, Ishan builds the Landing page (Screen 0) — it's fully static, has zero backend dependency, and shares no files with Dev's Login/Org Setup work, so it's a clean way to keep both people moving from hour one instead of Ishan waiting on Dev's auth API.

**Done when:** editing a department in Screen 3 immediately updates the department picklists on Screens 4 and 5 live (the mockup calls this out explicitly — treat it as an acceptance test, not a footnote). Landing page's `Get started`/`Log in` buttons route correctly once Dev's Login/Signup routes exist.

### Phase 2 — Asset Registry (Screen 4) — **Dev**
- Register asset flow, directory with search bar + 3 filter dropdowns (Category/Status/Department) + table

**Done when:** searching `AF-0012` returns the Dell Laptop row with correct status pill.

### Phase 3 — Allocation & Transfer (Screen 5) — **Dev**
- Allocation form; conflict block renders immediately on selecting an already-allocated asset; transfer request form (From/To/Reason) submits under the conflict block; allocation history log per asset

**Done when:** selecting AF-0114 while it's held by Priya Shah reproduces the exact conflict card text and reveals the transfer form, matching the mockup.

### Phase 4 — Resource Booking (Screen 6) — **Ishan**
- Resource + date picker, vertical time-slot list, solid block for existing bookings, **dotted coral conflict overlay** for rejected overlapping requests, `Book a slot` action

**Done when:** requesting 9:30–10:30 against an existing 9:00–10:00 booking renders the dotted conflict box in place, without a page reload/toast-only rejection.

### Phase 5 — Maintenance Workflow (Screen 7) — **Ishan**
- Kanban board, 5 columns, **drag-and-drop between columns**
- Dragging a card into Approved flips the asset to Under Maintenance; dragging into Resolved flips it back to Available — this is the trigger mechanism, not a separate status dropdown

**Done when:** drag-drop is the only way to move a request between states, and the asset's status on Screen 4 updates accordingly.

### Phase 6 — Audit Cycles (Screen 8) — **Ishan**
- Cycle header block (scope/date/auditors), verification table with 3-state pill (Verified/Missing/Damaged), auto-counted discrepancy alert bar, `Close audit cycle` (irreversible, updates asset statuses e.g. confirmed-missing → Lost)

**Done when:** marking 2 of N assets Missing/Damaged auto-updates the alert bar's count without a manual save step.

### Phase 7 — Dashboard, Reports, Notifications (Screens 2, 9, 10) — **split: Dev takes Dashboard, Ishan takes Reports + Notifications**
- Dashboard: 6 KPI cards (2 rows of 3, per layout above), coral overdue banner, 3 quick actions, plain-text recent activity feed
- Reports: 2 charts (utilization by department, maintenance frequency) + 3 list sections (most used, idle, due-for-maintenance/retirement) + export
- Notifications/Activity: single feed, single table, filtered by the `All/Alerts/Approvals/Bookings` tab row, read/unread checkbox

**Done when:** every KPI number and every notification traces back to a real mutation from Phases 1–6 — nothing hardcoded, and the feed used in Screen 10 is the same data source whether you're looking at "Alerts" or "Bookings."

### Phase 8 — Polish pass — **Dev + Ishan, paired**
- Dex mascot on login + any empty states (not in the mockup, but needed since real usage will hit zero-data states the sketch doesn't show)
- Role-based nav/visibility audit (Employee shouldn't see Organization setup)
- Mobile pass, keyboard focus states, error copy pass

---

## 8. Team split — Dev & Ishan

Split as **vertical slices** (each person owns full-stack: DB fields → API → UI for their screens), not frontend/backend — that way the two of you are almost never editing the same file, and neither is blocked waiting on the other's API mid-build.

**The split:**

| | **Dev** — Core registry & identity | **Ishan** — Operational workflows & insight |
|---|---|---|
| Screens | Login, Screen 3 (Org Setup), Screen 4 (Assets), Screen 5 (Allocation & Transfer) | Screen 0 (Landing page), Screen 6 (Booking), Screen 7 (Maintenance Kanban), Screen 8 (Audit) |
| Phase 7 slice | Screen 2 (Dashboard) | Screen 9 (Reports) + Screen 10 (Notifications/Activity) |
| Why this half | Owns the entities everything else depends on (departments, employees, assets, who-holds-what) — needs to exist first anyway | Owns the entities that consume the registry, plus the one screen (Landing) that needs zero backend and can start immediately in parallel |

Rationale for the boundary: Screens 6/7/8 all *read* asset/employee/department data but never *write* to Departments, Categories, Employees, or the core Asset record — they only write to their own tables (Booking, MaintenanceRequest, AuditRecord) plus flipping `Asset.status`, which is a single enum field, not a schema they own. That's the actual conflict-avoidance mechanism: **each person's tables are written only by that person's code.**

### File/module ownership (backend)

Split `models.py` into a package instead of one file, one module per owner, imported into a single `models/__init__.py`:
- `models/department.py`, `models/employee.py`, `models/category.py`, `models/asset.py`, `models/allocation.py` → **Dev**
- `models/booking.py`, `models/maintenance.py`, `models/audit.py`, `models/notification.py` → **Ishan**
- `models/__init__.py` just re-exports both — each person only ever adds their own import line to it, so diffs don't collide.

Same pattern for `routers/`: each person's router files live in their own filenames (`routers/auth.py`, `routers/org.py`, `routers/assets.py`, `routers/allocations.py` vs. `routers/bookings.py`, `routers/maintenance.py`, `routers/audits.py`, `routers/notifications.py`). `main.py` only gets a one-line `app.include_router(...)` per person — small, append-only, low-conflict.

### File/module ownership (frontend)

- `pages/`: one file per screen, and every screen above (including the new Landing page) has exactly one owner — zero overlap by construction.
- `api/`: same split as backend routers (`api/assets.ts`, `api/allocations.ts` vs. `api/bookings.ts`, `api/maintenance.ts`, `api/audits.ts`).
- `components/` (Sidebar, Topbar, KPICard, Badge, Modal, Button, Dex mascot): built **once**, during the split half of Phase 0 below, then treated as frozen/shared — avoid both people editing shared components mid-build; if a shared component needs a change later, whoever needs it pings the other rather than editing solo.
- `routes.tsx`: shared file, but each person only ever appends one `<Route>` line for their own screens — same append-only pattern as `main.py`.

### Splitting Phase 0 itself

Phase 0 is the one phase that isn't a clean vertical slice, so split it horizontally just this once:
- **Dev:** DB schema + migrations + seed script + `database.py`
- **Ishan:** Design tokens in Tailwind config, the shared component shell (sidebar/topbar/canvas), Dex mascot SVG

Both land before Phase 1 starts, so nobody's vertical slice work touches the other's Phase 0 output.

### Sync points (to actually avoid conflicts, not just assign blame after)

1. **Branch per phase**, not per person — `phase-1-dev`, `phase-4-ishan`, etc. Merge to main at the end of each phase, not continuously.
2. Pull `main` before starting each new phase — Dev's Phase 3 (Allocation) changes `Asset.status`, which Ishan's Phase 5 (Maintenance) also flips; both should build against the latest `Asset` model, not a stale one.
3. **Phase 7 is the one true dependency point** — Dashboard/Reports/Notifications read data from both halves. Don't start Phase 7 until both of you have merged Phases 1–6, or you'll be building against fake/incomplete data.
4. If Reports (Ishan) needs a field Dev's Asset model doesn't have yet (e.g. acquisition date for "nearing retirement"), that's a quick message, not a solo edit to `models/asset.py`.

---

## 9. Suggested demo order

Signup as Employee → Admin promotes to Asset Manager (Screen 3, Employee tab) → register an asset (Screen 4) → trigger the Priya/Raj-style conflict block (Screen 5) → book Room B2 and show the dotted conflict overlay (Screen 6) → drag a maintenance card from Pending to Approved and show the asset flip to Under Maintenance (Screen 7) → run a mini audit cycle and watch the discrepancy count update live (Screen 8) → land on the dashboard and Reports screen and show every number/chart ties back to what judges just watched happen (Screens 2, 9) → show the same event appear in Notifications (Screen 10).

## 10. Open questions before Phase 1 starts

1. Confirm the **Dashboard's 3rd KPI card** — I'm building it as "Maintenance Today" (from the PS list) since the mockup's own label ("Available 4") looks like a copy/paste leftover from card 1. Confirm or correct.
2. Confirm you want the **cute/warm design tokens** applied over this structure rather than keeping the sketch's literal dark theme.
3. Any of the 10 screens you'd cut for time — Reports (Screen 9) and Audit (Screen 8) are usually first to trim, but note Screen 7's drag-and-drop kanban is now a confirmed scope item, not optional polish.