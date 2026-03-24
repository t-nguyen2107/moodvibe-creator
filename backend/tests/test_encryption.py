import pytest
from app.utils.encryption import encryption_service


def test_encrypt_decrypt():
    """Test encryption and decryption"""
    original_text = "my_secret_api_key_12345"

    # Encrypt
    encrypted = encryption_service.encrypt(original_text)
    assert encrypted != original_text
    assert len(encrypted) > 0

    # Decrypt
    decrypted = encryption_service.decrypt(encrypted)
    assert decrypted == original_text


def test_encrypt_different_results():
    """Test that encrypting same text twice gives different results (due to IV)"""
    text = "test_api_key"

    encrypted1 = encryption_service.encrypt(text)
    encrypted2 = encryption_service.encrypt(text)

    # Should be different due to random IV
    assert encrypted1 != encrypted2

    # But both should decrypt to same value
    assert encryption_service.decrypt(encrypted1) == text
    assert encryption_service.decrypt(encrypted2) == text


def test_mask_key():
    """Test key masking"""
    api_key = "sk-1234567890abcdef"
    masked = encryption_service.mask_key(api_key, visible_chars=4)

    assert "sk-1" in masked
    assert "*" in masked
    assert api_key not in masked


def test_mask_key_short():
    """Test masking short key"""
    short_key = "ab"
    masked = encryption_service.mask_key(short_key, visible_chars=4)
    assert masked == "****"


def test_mask_key_custom_length():
    """Test masking with custom visible length"""
    api_key = "my_secret_key_12345"
    masked = encryption_service.mask_key(api_key, visible_chars=2)

    assert "my" in masked
    assert "*" in masked
    # Masked key should have same length as original (just with * replacing chars)
    assert len(masked) == len(api_key)
    # But should not reveal the full key
    assert api_key not in masked


def test_decrypt_invalid_text():
    """Test decryption with invalid text"""
    with pytest.raises(Exception):
        encryption_service.decrypt("invalid_encrypted_text")
