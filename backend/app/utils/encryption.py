from cryptography.fernet import Fernet
import base64
import hashlib
from app.config import settings


class EncryptionService:
    def __init__(self):
        # Use MASTER_ENCRYPTION_KEY from settings
        # If not set, generate a warning
        key = settings.MASTER_ENCRYPTION_KEY.encode()
        # Derive a proper Fernet key from the master key
        kdf = hashlib.sha256(key)
        derived_key = base64.urlsafe_b64encode(kdf.digest())
        self.cipher = Fernet(derived_key)

    def encrypt(self, data: str) -> str:
        """Encrypt a string using AES-256-GCM"""
        encrypted = self.cipher.encrypt(data.encode())
        return base64.b64encode(encrypted).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt a string"""
        try:
            encrypted = base64.b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(encrypted)
            return decrypted.decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

    def mask_key(self, api_key: str, visible_chars: int = 4) -> str:
        """Return a masked version of the API key for display"""
        if not api_key or len(api_key) <= visible_chars:
            return "****"
        return api_key[:visible_chars] + "*" * (len(api_key) - visible_chars)


# Global instance
encryption_service = EncryptionService()
