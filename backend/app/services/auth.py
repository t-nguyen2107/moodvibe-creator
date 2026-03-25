"""
Authentication Service
Handles JWT tokens, password hashing, and OAuth authentication
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import httpx

from app.config import settings
from app.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_oauth(db: Session, provider: str, provider_id: str) -> Optional[User]:
    """Get user by OAuth provider ID"""
    if provider == "google":
        return db.query(User).filter(User.google_id == provider_id).first()
    elif provider == "facebook":
        return db.query(User).filter(User.facebook_id == provider_id).first()
    elif provider == "github":
        return db.query(User).filter(User.github_id == provider_id).first()
    return None


def create_user(
    db: Session,
    email: Optional[str] = None,
    password: Optional[str] = None,
    name: Optional[str] = None,
    google_id: Optional[str] = None,
    facebook_id: Optional[str] = None,
    github_id: Optional[str] = None,
    avatar_url: Optional[str] = None
) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(password) if password else None
    
    user = User(
        email=email,
        hashed_password=hashed_password,
        name=name,
        google_id=google_id,
        facebook_id=facebook_id,
        github_id=github_id,
        avatar_url=avatar_url,
        is_active=True,
        is_verified=False  # No email verification required
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def verify_google_token(id_token: str) -> Dict[str, Any]:
    """Verify Google ID token and return user info"""
    from google.auth.transport import requests
    from google.oauth2 import id_token as google_id_token
    
    try:
        # Verify the token
        idinfo = google_id_token.verify_oauth2_token(
            id_token, 
            requests.Request(),
            clock_skew_in_seconds=10
        )
        
        # Token is valid, return user info
        return {
            'id': idinfo['sub'],
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'email_verified': idinfo.get('email_verified', False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )


async def get_google_user_info(access_token: str) -> Dict[str, Any]:
    """Get user info from Google OAuth"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get user info from Google"
            )
        return response.json()


async def get_facebook_user_info(access_token: str) -> Dict[str, Any]:
    """Get user info from Facebook OAuth"""
    async with httpx.AsyncClient() as client:
        # Get user info
        response = await client.get(
            f"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={access_token}"
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get user info from Facebook"
            )
        return response.json()


async def get_github_user_info(access_token: str) -> Dict[str, Any]:
    """Get user info from GitHub OAuth"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get user info from GitHub"
            )
        return response.json()


async def get_github_user_email(access_token: str) -> Optional[str]:
    """Get primary email from GitHub (needed because /user doesn't always return email)"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        if response.status_code != 200:
            return None
        
        emails = response.json()
        for email in emails:
            if email.get("primary") and email.get("verified"):
                return email.get("email")
        return None
