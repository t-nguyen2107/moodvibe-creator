"""
Authentication Router
Handles user registration, login, and OAuth authentication
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.models.database import get_db
from app.schemas.auth import (
    UserCreate, UserResponse, UserLogin, Token, OAuthLogin
)
from app.services.auth import (
    authenticate_user,
    create_user,
    create_access_token,
    decode_token,
    get_user_by_email,
    get_user_by_oauth,
    verify_google_token,
    get_facebook_user_info,
    get_github_user_info,
    get_github_user_email
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(get_current_user.__annotations__.get("User")).filter_by(id=int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


# Import User model for type hint
from app.models.user import User
get_current_user.__annotations__["User"] = User


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email and password"""
    if not user_data.email or not user_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    # Check if email already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        name=user_data.name
    )
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password"""
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/oauth/google", response_model=Token)
async def login_google(oauth_data: OAuthLogin, db: Session = Depends(get_db)):
    """Login or register with Google OAuth"""
    # Verify Google ID token
    credential = oauth_data.credential or oauth_data.access_token
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential is required"
        )
    
    user_info = await verify_google_token(credential)
    
    google_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    
    # Check if user exists
    user = get_user_by_oauth(db, "google", google_id)
    
    if not user and email:
        # Try to find by email
        user = get_user_by_email(db, email)
        if user:
            # Link Google account
            user.google_id = google_id
            if picture and not user.avatar_url:
                user.avatar_url = picture
            db.commit()
    
    if not user:
        # Create new user
        user = create_user(
            db=db,
            email=email,
            name=name,
            google_id=google_id,
            avatar_url=picture
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/oauth/facebook", response_model=Token)
async def login_facebook(oauth_data: OAuthLogin, db: Session = Depends(get_db)):
    """Login or register with Facebook OAuth"""
    # Get user info from Facebook
    user_info = await get_facebook_user_info(oauth_data.access_token)
    
    facebook_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name")
    picture_data = user_info.get("picture", {})
    picture = picture_data.get("data", {}).get("url") if picture_data else None
    
    # Check if user exists
    user = get_user_by_oauth(db, "facebook", facebook_id)
    
    if not user and email:
        # Try to find by email
        user = get_user_by_email(db, email)
        if user:
            # Link Facebook account
            user.facebook_id = facebook_id
            db.commit()
    
    if not user:
        # Create new user
        user = create_user(
            db=db,
            email=email,
            name=name,
            facebook_id=facebook_id,
            avatar_url=picture
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/oauth/github", response_model=Token)
async def login_github(oauth_data: OAuthLogin, db: Session = Depends(get_db)):
    """Login or register with GitHub OAuth"""
    # Get user info from GitHub
    user_info = await get_github_user_info(oauth_data.access_token)
    
    github_id = str(user_info.get("id"))
    email = user_info.get("email")
    name = user_info.get("name") or user_info.get("login")
    avatar_url = user_info.get("avatar_url")
    
    # GitHub may not return email in user info, fetch from emails endpoint
    if not email:
        email = await get_github_user_email(oauth_data.access_token)
    
    # Check if user exists
    user = get_user_by_oauth(db, "github", github_id)
    
    if not user and email:
        # Try to find by email
        user = get_user_by_email(db, email)
        if user:
            # Link GitHub account
            user.github_id = github_id
            db.commit()
    
    if not user:
        # Create new user
        user = create_user(
            db=db,
            email=email,
            name=name,
            github_id=github_id,
            avatar_url=avatar_url
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout():
    """Logout (client should discard token)"""
    return {"message": "Successfully logged out"}
