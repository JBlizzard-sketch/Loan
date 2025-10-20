"""
Settings service for secure API key management with encryption
"""
import os
import json
from pathlib import Path
from cryptography.fernet import Fernet
from dotenv import load_dotenv, set_key, dotenv_values

load_dotenv()

class SettingsService:
    def __init__(self):
        self.env_file = Path(".env")
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher = Fernet(self.encryption_key)
        # Load and decrypt env vars on initialization
        self._load_decrypted_env()
        
    def _get_or_create_encryption_key(self):
        """Get existing encryption key or create a new one"""
        key_file = Path(".encryption_key")
        if key_file.exists():
            return key_file.read_bytes()
        else:
            key = Fernet.generate_key()
            key_file.write_bytes(key)
            # Ensure the file is only readable by owner
            os.chmod(key_file, 0o600)
            return key
    
    def encrypt_value(self, value: str) -> str:
        """Encrypt a string value"""
        if not value:
            return ""
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt a string value"""
        if not encrypted_value:
            return ""
        try:
            return self.cipher.decrypt(encrypted_value.encode()).decode()
        except Exception:
            return ""
    
    def update_settings(self, settings: dict) -> bool:
        """Update settings in .env file with encryption"""
        try:
            # Ensure .env file exists
            if not self.env_file.exists():
                self.env_file.touch()
                os.chmod(self.env_file, 0o600)
            
            # Update each setting
            for key, value in settings.items():
                if value and value.strip():  # Only update non-empty values
                    # Convert to environment variable format
                    env_key = key.upper()
                    
                    # Encrypt sensitive values before storing
                    encrypted_value = self.encrypt_value(value)
                    set_key(str(self.env_file), env_key, encrypted_value)
                    
                    # Also set decrypted value in current environment for immediate use
                    os.environ[env_key] = value
            
            # Reload environment with decryption
            self._load_decrypted_env()
            return True
        except Exception as e:
            print(f"Error updating settings: {e}")
            return False
    
    def _load_decrypted_env(self):
        """Load and decrypt environment variables"""
        env_vars = dotenv_values(str(self.env_file))
        
        # Decrypt and set in environment
        for key, encrypted_value in env_vars.items():
            if encrypted_value:
                try:
                    # Try to decrypt - if it fails, assume it's already decrypted
                    decrypted = self.decrypt_value(encrypted_value)
                    if decrypted:
                        os.environ[key] = decrypted
                except Exception:
                    # If decryption fails, use the value as-is (backwards compatibility)
                    os.environ[key] = encrypted_value
    
    def get_settings_status(self) -> dict:
        """Check which settings are configured by checking if they can be decrypted"""
        env_vars = dotenv_values(str(self.env_file))
        
        def is_configured(key):
            encrypted = env_vars.get(key)
            if not encrypted:
                return False
            # Try to decrypt to verify it's valid
            try:
                decrypted = self.decrypt_value(encrypted)
                return bool(decrypted)
            except Exception:
                # If can't decrypt, check if it exists in current env (already loaded)
                return bool(os.getenv(key))
        
        return {
            "configured": {
                "openai_api_key": is_configured("OPENAI_API_KEY"),
                "twilio_account_sid": is_configured("TWILIO_ACCOUNT_SID"),
                "twilio_auth_token": is_configured("TWILIO_AUTH_TOKEN"),
                "twilio_phone_number": is_configured("TWILIO_PHONE_NUMBER"),
                "telegram_bot_token": is_configured("TELEGRAM_BOT_TOKEN"),
                "telegram_chat_id": is_configured("TELEGRAM_CHAT_ID")
            }
        }
    
    def get_redacted_settings(self) -> dict:
        """Get settings with redacted values (for display purposes)"""
        env_vars = dotenv_values(str(self.env_file))
        
        def redact(value):
            if not value:
                return ""
            if len(value) <= 8:
                return "•" * len(value)
            return value[:4] + "•" * (len(value) - 8) + value[-4:]
        
        return {
            "openai_api_key": redact(env_vars.get("OPENAI_API_KEY", "")),
            "twilio_account_sid": redact(env_vars.get("TWILIO_ACCOUNT_SID", "")),
            "twilio_auth_token": redact(env_vars.get("TWILIO_AUTH_TOKEN", "")),
            "twilio_phone_number": env_vars.get("TWILIO_PHONE_NUMBER", ""),
            "telegram_bot_token": redact(env_vars.get("TELEGRAM_BOT_TOKEN", "")),
            "telegram_chat_id": env_vars.get("TELEGRAM_CHAT_ID", "")
        }

# Global instance
settings_service = SettingsService()
