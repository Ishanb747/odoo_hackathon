"""
routers/auth.py — Phase 1 (Dev)
JWT-based authentication: signup, login, /me
"""
from datetime import datetime, timedelta, timezone
from typing import Annotated

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Employee, EmployeeRole

router = APIRouter()

# ── OAuth2 token extraction from Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Pydantic schemas ──────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: EmployeeRole
    department_id: int | None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Internal helpers ──────────────────────────────────────────

# bcrypt has a hard 72-byte limit — truncate before hashing
_MAX_PW_BYTES = 72

def _hash_password(plain: str) -> str:
    pw_bytes = plain.encode("utf-8")[:_MAX_PW_BYTES]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    pw_bytes = plain.encode("utf-8")[:_MAX_PW_BYTES]
    return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))


def _create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _decode_token(token: str) -> int:
    """Decode JWT and return employee id. Raises 401 on any failure."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError
        return int(user_id)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Shared dependency — inject current user ───────────────────

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> Employee:
    user_id = _decode_token(token)
    employee = db.get(Employee, user_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return employee


def require_admin(current_user: Annotated[Employee, Depends(get_current_user)]) -> Employee:
    if current_user.role not in (EmployeeRole.admin, EmployeeRole.superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def require_superadmin(current_user: Annotated[Employee, Depends(get_current_user)]) -> Employee:
    if current_user.role != EmployeeRole.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin privileges required"
        )
    return current_user


# ── Endpoints ─────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Create a new employee account. Role defaults to 'employee'."""
    # Check if email is already taken
    existing = db.query(Employee).filter(Employee.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    employee = Employee(
        name=body.name,
        email=body.email,
        hashed_password=_hash_password(body.password),
        role=EmployeeRole.employee,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    token = _create_token(employee.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(employee))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    employee = db.query(Employee).filter(Employee.email == body.email).first()
    if not employee or not _verify_password(body.password, employee.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = _create_token(employee.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(employee))


@router.get("/me", response_model=UserOut)
def get_me(current_user: Annotated[Employee, Depends(get_current_user)]):
    """Return the currently authenticated user."""
    return current_user
