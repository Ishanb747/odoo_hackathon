"""
main.py — FastAPI application entry point
Routers added per-phase (append-only lines).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import settings
from database import SessionLocal
from routers.auth import router as auth_router
from routers.org import router as org_router
from routers.assets import router as assets_router
from routers.allocations import router as allocations_router

app = FastAPI(
    title="AssetFlow API",
    description="Enterprise Asset & Resource Management System",
    version="0.1.0",
)

def _local_dev_origins() -> list[str]:
    ports = {settings.FRONTEND_PORT, 3000, 5173}
    origins: list[str] = []
    for port in sorted(ports):
        origins.append(f"http://localhost:{port}")
        origins.append(f"http://127.0.0.1:{port}")
    return origins


# ── CORS — local frontend origins used during dev ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=_local_dev_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Phase 0: Health check ─────────────────────────────────────
@app.get("/health", tags=["health"])
def health_check():
    """Phase 0 acceptance test: DB connected + seed data present."""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT COUNT(*) FROM assets")).scalar()
        return {
            "status": "ok",
            "db": "connected",
            "seed_assets": result,
        }
    except Exception as e:
        return {
            "status": "error",
            "db": "unreachable",
            "detail": str(e),
        }
    finally:
        db.close()


# ── Phase 1 (Dev) ─────────────────────────────────────────────
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(org_router,  prefix="/org",  tags=["org"])

# ── Future routers — append one line per phase ────────────────
app.include_router(assets_router, prefix="/assets", tags=["assets"])
app.include_router(allocations_router, prefix="/allocations", tags=["allocations"])
# Phase 4 (Ishan): app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
# Phase 5 (Ishan): app.include_router(maintenance_router, prefix="/maintenance", tags=["maintenance"])
# Phase 6 (Ishan): app.include_router(audits_router, prefix="/audits", tags=["audits"])
# Phase 7 (both):  app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
# Phase 7 (Ishan): app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
