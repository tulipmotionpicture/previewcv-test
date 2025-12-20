# Backend Development Documentation
## PreviewCV & LetsMakeCV Shared Backend

> [!IMPORTANT]
> This document outlines the backend architecture for the shared FastAPI + PostgreSQL + Alembic backend that powers both **previewcv.com** and **letsmakecv.com**.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Core Functions](#core-functions)
5. [Authentication & Security](#authentication--security)
6. [File Storage (BunnyCDN)](#file-storage-bunnycdn)
7. [Database Migrations (Alembic)](#database-migrations-alembic)
8. [Environment Configuration](#environment-configuration)

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | High-performance async web framework |
| **Database** | PostgreSQL | Relational database for structured data |
| **ORM** | SQLAlchemy | Database abstraction and query building |
| **Migrations** | Alembic | Database schema version control |
| **Storage** | BunnyCDN | PDF file storage and delivery |
| **Authentication** | JWT Tokens | Secure user authentication |
| **Validation** | Pydantic | Request/response data validation |

---

## Database Schema

### 1. Users Table
Stores user account information for both platforms.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(50) DEFAULT 'candidate', -- 'candidate' or 'recruiter'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_user_type (user_type),
    INDEX idx_users_created_at (created_at)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    user_type = Column(String(50), default='candidate', index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
```

---

### 2. Resumes Table
Stores resume metadata and PDF information.

```sql
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_name VARCHAR(255) NOT NULL,
    pdf_filename VARCHAR(500) NOT NULL, -- BunnyCDN filename
    pdf_url VARCHAR(1000), -- Full BunnyCDN URL
    permanent_token VARCHAR(100) UNIQUE NOT NULL, -- For sharing
    qr_code_base64 TEXT, -- QR code for sharing
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_resumes_user_id (user_id),
    INDEX idx_resumes_permanent_token (permanent_token),
    INDEX idx_resumes_is_active (is_active),
    INDEX idx_resumes_created_at (created_at)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_name = Column(String(255), nullable=False)
    pdf_filename = Column(String(500), nullable=False)
    pdf_url = Column(String(1000))
    permanent_token = Column(String(100), unique=True, nullable=False, index=True)
    qr_code_base64 = Column(Text)
    is_active = Column(Boolean, default=True, index=True)
    is_public = Column(Boolean, default=False)
    access_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    access_logs = relationship("ResumeAccessLog", back_populates="resume", cascade="all, delete-orphan")
```

---

### 3. Resume Access Logs Table
Tracks who accessed which resume and when.

```sql
CREATE TABLE resume_access_logs (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    referer VARCHAR(500),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_access_logs_resume_id (resume_id),
    INDEX idx_access_logs_accessed_at (accessed_at),
    INDEX idx_access_logs_ip_address (ip_address)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class ResumeAccessLog(Base):
    __tablename__ = "resume_access_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    ip_address = Column(String(45), index=True)
    user_agent = Column(Text)
    referer = Column(String(500))
    accessed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    resume = relationship("Resume", back_populates="access_logs")
```

---

### 4. Job Postings Table
Stores job listings for recruiters.

```sql
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    job_type VARCHAR(50), -- 'full-time', 'part-time', 'contract', 'internship'
    experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'lead'
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_jobs_recruiter_id (recruiter_id),
    INDEX idx_jobs_is_active (is_active),
    INDEX idx_jobs_created_at (created_at),
    INDEX idx_jobs_job_type (job_type),
    INDEX idx_jobs_experience_level (experience_level)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    location = Column(String(255))
    job_type = Column(String(50), index=True)
    experience_level = Column(String(50), index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    salary_range = Column(String(100))
    is_active = Column(Boolean, default=True, index=True)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    recruiter = relationship("User", back_populates="job_postings")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
```

---

### 5. Job Applications Table
Tracks candidate applications to jobs.

```sql
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'
    cover_letter TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    
    -- Constraints
    UNIQUE(job_id, candidate_id),
    
    -- Indexes
    INDEX idx_applications_job_id (job_id),
    INDEX idx_applications_candidate_id (candidate_id),
    INDEX idx_applications_status (status),
    INDEX idx_applications_applied_at (applied_at)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"
    __table_args__ = (
        UniqueConstraint('job_id', 'candidate_id', name='uq_job_candidate'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default='pending', index=True)
    cover_letter = Column(Text)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    reviewed_at = Column(DateTime(timezone=True))
    
    # Relationships
    job = relationship("JobPosting", back_populates="applications")
    candidate = relationship("User", foreign_keys=[candidate_id])
    resume = relationship("Resume")
```

---

### 6. API Tokens Table
Stores API tokens for external integrations.

```sql
CREATE TABLE api_tokens (
    id SERIAL PRIMARY KEY,
    token_key VARCHAR(100) UNIQUE NOT NULL,
    token_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_api_tokens_key (token_key),
    INDEX idx_api_tokens_is_active (is_active)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class APIToken(Base):
    __tablename__ = "api_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token_key = Column(String(100), unique=True, nullable=False, index=True)
    token_name = Column(String(255))
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    last_used_at = Column(DateTime(timezone=True))
```

---

### 7. Recruiter Profiles Table
Stores detailed profile information for recruiters (both company and individual).

```sql
CREATE TABLE recruiter_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    recruiter_type VARCHAR(20) NOT NULL, -- 'company' or 'individual'
    
    -- Company fields
    company_name VARCHAR(255),
    company_website VARCHAR(500),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    
    -- Individual fields
    full_name VARCHAR(255),
    specialization VARCHAR(255),
    years_experience INTEGER,
    
    -- Common fields
    bio TEXT,
    logo_url VARCHAR(1000),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    location VARCHAR(255),
    
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_recruiter_profiles_user_id (user_id),
    INDEX idx_recruiter_profiles_username (username),
    INDEX idx_recruiter_profiles_recruiter_type (recruiter_type)
);
```

**SQLAlchemy Model:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    recruiter_type = Column(String(20), nullable=False, index=True)
    
    # Company fields
    company_name = Column(String(255))
    company_website = Column(String(500))
    company_size = Column(String(50))
    industry = Column(String(100))
    
    # Individual fields
    full_name = Column(String(255))
    specialization = Column(String(255))
    years_experience = Column(Integer)
    
    # Common fields
    bio = Column(Text)
    logo_url = Column(String(1000))
    phone = Column(String(50))
    linkedin_url = Column(String(500))
    location = Column(String(255))
    
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recruiter_profile")
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "user_type": "candidate"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": 1,
  "email": "user@example.com",
  "message": "User registered successfully"
}
```

**Function:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: str = "candidate"

@router.post("/register")
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = pwd_context.hash(user_data.password)
    
    # Create user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        user_type=user_data.user_type
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "user_id": new_user.id,
        "email": new_user.email,
        "message": "User registered successfully"
    }
```

---

#### POST `/api/v1/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "candidate"
  }
}
```

**Function:**
```python
from datetime import datetime, timedelta
from jose import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

SECRET_KEY = "your-secret-key-here"  # Store in environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "user_type": user.user_type},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type
        }
    }
```

---

### Resume Endpoints

#### GET `/api/v1/shared/public/resume/{permanent_token}`
**Public endpoint** - Fetch resume data by permanent token (used by PreviewCV).

**Headers:**
```
X-API-Token: <shared_api_token>
```

**Response:**
```json
{
  "success": true,
  "resume_id": 123,
  "resume_name": "John_Doe_Resume.pdf",
  "pdf_signed_url": "https://letsmakecv.b-cdn.net/pdfs/resume_123.pdf?token=...",
  "permanent_token": "abc123xyz789",
  "qr_code_base64": "data:image/png;base64,iVBORw0KG...",
  "access_count": 45,
  "last_accessed_at": "2025-12-20T10:30:00Z",
  "created_at": "2025-12-01T08:00:00Z"
}
```

**Function:**
```python
from fastapi import Header, Request
import secrets
from datetime import datetime, timedelta

def generate_bunny_signed_url(filename: str, expire_seconds: int = 3600) -> str:
    """Generate signed URL for BunnyCDN"""
    base_url = "https://letsmakecv.b-cdn.net"
    security_key = "your-bunny-security-key"  # From env
    expires = int((datetime.utcnow() + timedelta(seconds=expire_seconds)).timestamp())
    
    # Create signature
    string_to_sign = f"{security_key}{filename}{expires}"
    import hashlib
    token = hashlib.md5(string_to_sign.encode()).hexdigest()
    
    return f"{base_url}/{filename}?token={token}&expires={expires}"

@router.get("/shared/public/resume/{permanent_token}")
async def get_public_resume(
    permanent_token: str,
    request: Request,
    x_api_token: str = Header(..., alias="X-API-Token"),
    db: Session = Depends(get_db)
):
    # Validate API token
    api_token = db.query(APIToken).filter(
        APIToken.token_key == x_api_token,
        APIToken.is_active == True
    ).first()
    
    if not api_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API token"
        )
    
    # Update API token last used
    api_token.last_used_at = datetime.utcnow()
    
    # Find resume
    resume = db.query(Resume).filter(
        Resume.permanent_token == permanent_token,
        Resume.is_active == True
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Log access
    access_log = ResumeAccessLog(
        resume_id=resume.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        referer=request.headers.get("referer")
    )
    db.add(access_log)
    
    # Update access count
    resume.access_count += 1
    resume.last_accessed_at = datetime.utcnow()
    db.commit()
    
    # Generate signed URL
    pdf_signed_url = generate_bunny_signed_url(resume.pdf_filename, expire_seconds=3600)
    
    return {
        "success": True,
        "resume_id": resume.id,
        "resume_name": resume.resume_name,
        "pdf_signed_url": pdf_signed_url,
        "permanent_token": resume.permanent_token,
        "qr_code_base64": resume.qr_code_base64,
        "access_count": resume.access_count,
        "last_accessed_at": resume.last_accessed_at.isoformat() if resume.last_accessed_at else None,
        "created_at": resume.created_at.isoformat()
    }
```

---

#### POST `/api/v1/resumes/upload`
Upload a new resume PDF (authenticated endpoint).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request (multipart/form-data):**
```
file: <PDF file>
resume_name: "My Professional Resume"
is_public: true
```

**Response:**
```json
{
  "success": true,
  "resume_id": 123,
  "permanent_token": "abc123xyz789",
  "preview_url": "https://previewcv.com/r/abc123xyz789",
  "qr_code_base64": "data:image/png;base64,..."
}
```

**Function:**
```python
from fastapi import UploadFile, File, Form
import qrcode
import io
import base64
import uuid

async def upload_to_bunny_cdn(file: UploadFile, filename: str) -> str:
    """Upload file to BunnyCDN storage"""
    import httpx
    
    storage_zone = "your-storage-zone"
    access_key = "your-bunny-access-key"
    
    url = f"https://storage.bunnycdn.com/{storage_zone}/pdfs/{filename}"
    headers = {"AccessKey": access_key}
    
    content = await file.read()
    
    async with httpx.AsyncClient() as client:
        response = await client.put(url, headers=headers, content=content)
        response.raise_for_status()
    
    return filename

def generate_qr_code(url: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

@router.post("/resumes/upload")
async def upload_resume(
    file: UploadFile = File(...),
    resume_name: str = Form(...),
    is_public: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"resume_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
    
    # Upload to BunnyCDN
    pdf_filename = await upload_to_bunny_cdn(file, unique_filename)
    
    # Generate permanent token
    permanent_token = secrets.token_urlsafe(32)
    
    # Generate QR code
    preview_url = f"https://previewcv.com/r/{permanent_token}"
    qr_code_base64 = generate_qr_code(preview_url)
    
    # Create resume record
    new_resume = Resume(
        user_id=current_user.id,
        resume_name=resume_name,
        pdf_filename=pdf_filename,
        pdf_url=f"https://letsmakecv.b-cdn.net/pdfs/{pdf_filename}",
        permanent_token=permanent_token,
        qr_code_base64=qr_code_base64,
        is_public=is_public
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return {
        "success": True,
        "resume_id": new_resume.id,
        "permanent_token": permanent_token,
        "preview_url": preview_url,
        "qr_code_base64": qr_code_base64
    }
```

---

#### GET `/api/v1/resumes/my-resumes`
Get all resumes for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "resumes": [
    {
      "id": 123,
      "resume_name": "My Professional Resume",
      "permanent_token": "abc123xyz789",
      "preview_url": "https://previewcv.com/r/abc123xyz789",
      "access_count": 45,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00Z"
    }
  ]
}
```

**Function:**
```python
@router.get("/resumes/my-resumes")
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_active == True
    ).order_by(Resume.created_at.desc()).all()
    
    return {
        "success": True,
        "resumes": [
            {
                "id": r.id,
                "resume_name": r.resume_name,
                "permanent_token": r.permanent_token,
                "preview_url": f"https://previewcv.com/r/{r.permanent_token}",
                "access_count": r.access_count,
                "is_active": r.is_active,
                "created_at": r.created_at.isoformat()
            }
            for r in resumes
        ]
    }
```

---

### Job Posting Endpoints

#### POST `/api/v1/jobs/create`
Create a new job posting (recruiter only).

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company_name": "Tech Corp",
  "location": "San Francisco, CA",
  "job_type": "full-time",
  "experience_level": "senior",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "salary_range": "$120k - $180k"
}
```

**Function:**
```python
class JobCreate(BaseModel):
    title: str
    company_name: str
    location: str
    job_type: str
    experience_level: str
    description: str
    requirements: str = None
    salary_range: str = None

@router.post("/jobs/create")
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can create job postings"
        )
    
    new_job = JobPosting(
        recruiter_id=current_user.id,
        **job_data.dict()
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return {
        "success": True,
        "job_id": new_job.id,
        "message": "Job posting created successfully"
    }
```

---

#### GET `/api/v1/jobs/list`
List all active job postings.

**Query Parameters:**
- `job_type` (optional)
- `experience_level` (optional)
- `limit` (default: 20)
- `offset` (default: 0)

**Function:**
```python
@router.get("/jobs/list")
async def list_jobs(
    job_type: str = None,
    experience_level: str = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(JobPosting).filter(JobPosting.is_active == True)
    
    if job_type:
        query = query.filter(JobPosting.job_type == job_type)
    if experience_level:
        query = query.filter(JobPosting.experience_level == experience_level)
    
    total = query.count()
    jobs = query.order_by(JobPosting.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "total": total,
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company_name": j.company_name,
                "location": j.location,
                "job_type": j.job_type,
                "experience_level": j.experience_level,
                "salary_range": j.salary_range,
                "created_at": j.created_at.isoformat()
            }
            for j in jobs
        ]
    }
```

---

#### POST `/api/v1/jobs/{job_id}/apply`
Apply to a job posting.

**Request:**
```json
{
  "resume_id": 123,
  "cover_letter": "I am very interested..."
}
```

**Function:**
```python
class JobApply(BaseModel):
    resume_id: int
    cover_letter: str = None

@router.post("/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: int,
    application_data: JobApply,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify job exists
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify resume belongs to user
    resume = db.query(Resume).filter(
        Resume.id == application_data.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check if already applied
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.candidate_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Create application
    application = JobApplication(
        job_id=job_id,
        candidate_id=current_user.id,
        resume_id=application_data.resume_id,
        cover_letter=application_data.cover_letter
    )
    
    db.add(application)
    job.applications_count += 1
    db.commit()
    
    return {
        "success": True,
        "message": "Application submitted successfully"
    }
```

---

### Recruiter Profile Endpoints

#### POST `/api/v1/auth/register/recruiter`
Register a new recruiter account with profile information.

**Request Body:**
```json
{
  "email": "recruiter@company.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "user_type": "recruiter",
  "recruiter_profile": {
    "username": "techcorp",
    "recruiter_type": "company",
    "company_name": "TechCorp Inc.",
    "company_website": "https://techcorp.com",
    "company_size": "201-500",
    "industry": "Technology",
    "bio": "Leading technology company...",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "linkedin_url": "https://linkedin.com/company/techcorp"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user_id": 1,
  "profile_id": 1,
  "username": "techcorp",
  "public_profile_url": "https://previewcv.com/recruiter/profile/techcorp",
  "message": "Recruiter account created successfully"
}
```

**Function:**
```python
from pydantic import BaseModel
from typing import Optional

class RecruiterProfileCreate(BaseModel):
    username: str
    recruiter_type: str  # 'company' or 'individual'
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    years_experience: Optional[int] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None

class RecruiterRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: str = "recruiter"
    recruiter_profile: RecruiterProfileCreate

@router.post("/auth/register/recruiter")
async def register_recruiter(
    recruiter_data: RecruiterRegister,
    db: Session = Depends(get_db)
):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == recruiter_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username is taken
    existing_profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.username == recruiter_data.recruiter_profile.username
    ).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password
    hashed_password = pwd_context.hash(recruiter_data.password)
    
    # Create user
    new_user = User(
        email=recruiter_data.email,
        hashed_password=hashed_password,
        full_name=recruiter_data.full_name,
        user_type="recruiter"
    )
    db.add(new_user)
    db.flush()
    
    # Create recruiter profile
    profile_data = recruiter_data.recruiter_profile.dict()
    new_profile = RecruiterProfile(
        user_id=new_user.id,
        **profile_data
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return {
        "success": True,
        "user_id": new_user.id,
        "profile_id": new_profile.id,
        "username": new_profile.username,
        "public_profile_url": f"https://previewcv.com/recruiter/profile/{new_profile.username}",
        "message": "Recruiter account created successfully"
    }
```

---

#### GET `/api/v1/recruiters/profile/{username}`
Get public recruiter profile by username.

**Response:**
```json
{
  "success": true,
  "profile": {
    "username": "techcorp",
    "recruiter_type": "company",
    "company_name": "TechCorp Inc.",
    "bio": "Leading technology company...",
    "location": "San Francisco, CA",
    "is_verified": true,
    "created_at": "2025-12-01T08:00:00Z"
  }
}
```

**Function:**
```python
@router.get("/recruiters/profile/{username}")
async def get_recruiter_profile(
    username: str,
    db: Session = Depends(get_db)
):
    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.username == username
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter profile not found"
        )
    
    return {
        "success": True,
        "profile": {
            "username": profile.username,
            "recruiter_type": profile.recruiter_type,
            "company_name": profile.company_name,
            "full_name": profile.full_name,
            "bio": profile.bio,
            "location": profile.location,
            "company_website": profile.company_website,
            "linkedin_url": profile.linkedin_url,
            "is_verified": profile.is_verified,
            "created_at": profile.created_at.isoformat()
        }
    }
```

---

#### PUT `/api/v1/recruiters/profile`
Update own recruiter profile (authenticated).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio text...",
  "phone": "+1 (555) 999-8888",
  "location": "New York, NY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Function:**
```python
@router.put("/recruiters/profile")
async def update_recruiter_profile(
    profile_data: RecruiterProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can update recruiter profiles"
        )
    
    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter profile not found"
        )
    
    # Update profile fields
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Profile updated successfully"
    }
```

---

## Core Functions

### Authentication Helper Functions

```python
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user
```

---

### Database Connection

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/previewcv_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Authentication & Security

### JWT Token Configuration
- **Algorithm**: HS256
- **Expiration**: 30 minutes (configurable)
- **Secret Key**: Stored in environment variable

### API Token Validation
- Shared API token for PreviewCV integration
- Stored in `api_tokens` table
- Validated on public endpoints

### Security Headers
```python
security_headers = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

---

## File Storage (BunnyCDN)

### Configuration
- **Storage Zone**: `your-storage-zone`
- **CDN URL**: `https://letsmakecv.b-cdn.net`
- **Folder**: `pdfs/`

### Signed URL Generation
```python
def generate_bunny_signed_url(filename: str, expire_seconds: int = 3600) -> str:
    base_url = os.getenv("BUNNY_CDN_BASE_URL")
    security_key = os.getenv("BUNNY_SECURITY_KEY")
    expires = int((datetime.utcnow() + timedelta(seconds=expire_seconds)).timestamp())
    
    string_to_sign = f"{security_key}{filename}{expires}"
    token = hashlib.md5(string_to_sign.encode()).hexdigest()
    
    return f"{base_url}/{filename}?token={token}&expires={expires}"
```

---

## Database Migrations (Alembic)

### Initial Setup
```bash
# Initialize Alembic
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

### Migration Script Example
```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('user_type', sa.String(50), default='candidate'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email')
    op.drop_table('users')
```

---

## Environment Configuration

### `.env` File
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/previewcv_db

# JWT
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# BunnyCDN
BUNNY_CDN_BASE_URL=https://letsmakecv.b-cdn.net
BUNNY_SECURITY_KEY=your-bunny-security-key
BUNNY_STORAGE_ZONE=your-storage-zone
BUNNY_ACCESS_KEY=your-bunny-access-key
BUNNY_FOLDER=pdfs

# API Tokens
SHARED_LINK_API_TOKEN=your-shared-api-token-for-previewcv

# Application
APP_NAME=LetsMakeCV
ENVIRONMENT=production
```

---

## Project Structure

```
backend/
├── alembic/
│   ├── versions/
│   │   └── 001_initial_schema.py
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── resumes.py
│   │   ├── jobs.py
│   │   └── shared.py
│   └── utils/
│       ├── __init__.py
│       ├── auth.py
│       ├── bunny_cdn.py
│       └── qr_code.py
├── .env
├── requirements.txt
└── alembic.ini
```

---

## Requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.0
httpx==0.25.1
qrcode[pil]==7.4.2
python-dotenv==1.0.0
```

---

## Next Steps

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Run Alembic migrations**
4. **Create initial API token for PreviewCV**
5. **Test authentication flow**
6. **Test resume upload and sharing**
7. **Implement job posting features**
8. **Add analytics and monitoring**

---

> [!TIP]
> Use FastAPI's automatic documentation at `/docs` to test all endpoints interactively during development.
