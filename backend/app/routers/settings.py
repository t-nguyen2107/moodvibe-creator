from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.api_key import APIKey
from app.models.user import User
from app.schemas.api_key import APIKeyCreate, APIKeyResponse
from app.utils.encryption import encryption_service
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.post("/api-keys")
async def store_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Store encrypted API key"""
    user_id = current_user.id

    # Check if key already exists for this service
    existing = db.query(APIKey).filter(
        APIKey.user_id == user_id,
        APIKey.service == key_data.service
    ).first()

    encrypted_key = encryption_service.encrypt(key_data.api_key)

    if existing:
        # Update existing key
        existing.encrypted_key = encrypted_key
        db.commit()
        return {"message": "API key updated successfully"}
    else:
        # Create new key
        db_key = APIKey(
            user_id=user_id,
            service=key_data.service,
            encrypted_key=encrypted_key
        )
        db.add(db_key)
        db.commit()

        return {"message": "API key stored successfully"}


@router.get("/api-keys")
async def get_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of stored API keys (masked)"""
    user_id = current_user.id

    keys = db.query(APIKey).filter(APIKey.user_id == user_id).all()

    result = []
    for key in keys:
        result.append({
            "id": key.id,
            "service": key.service,
            "has_key": True,
            "masked_key": encryption_service.mask_key(key.encrypted_key[:10])  # Partially masked
        })

    return {"keys": result}


@router.delete("/api-keys/{service}")
async def delete_api_key(
    service: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete stored API key"""
    user_id = current_user.id

    key = db.query(APIKey).filter(
        APIKey.user_id == user_id,
        APIKey.service == service
    ).first()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    db.delete(key)
    db.commit()

    return {"message": "API key deleted successfully"}
