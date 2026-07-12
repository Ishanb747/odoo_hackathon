"""
main.py — FastAPI application entry point
Phase 0: health check + CORS only.
Routers added per-phase (append-only lines).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import SessionLocal

app = FastAPI(
    title="AssetFlow API",
    description="Enterprise Asset & Resource Management System",
    version="0.1.0",
)

# ── CORS — allow Vite dev server ──────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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


# ── Future routers — append one line per phase ────────────────
# Phase 1 (Dev):   app.include_router(auth_router, prefix="/auth", tags=["auth"])
# Phase 1 (Dev):   app.include_router(org_router,  prefix="/org",  tags=["org"])
# Phase 2 (Dev):   app.include_router(assets_router, prefix="/assets", tags=["assets"])
# Phase 3 (Dev):   app.include_router(allocations_router, prefix="/allocations", tags=["allocations"])
# Phase 4 (Ishan): app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
# Phase 5 (Ishan): app.include_router(maintenance_router, prefix="/maintenance", tags=["maintenance"])
# Phase 6 (Ishan): app.include_router(audits_router, prefix="/audits", tags=["audits"])
# Phase 7 (both):  app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
# Phase 7 (Ishan): app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
