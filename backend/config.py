from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # ── Ports ─────────────────────────────────────────────────
    # Port this FastAPI server listens on (used by uvicorn CLI and CORS).
    BACKEND_PORT: int = 8000
    # Port the Vite dev server runs on (used to build CORS allow_origins).
    FRONTEND_PORT: int = 5173

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # type: ignore[call-arg]
