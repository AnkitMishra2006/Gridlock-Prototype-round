from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "guardianeye"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    # Twilio (for SMS/WhatsApp alerts)
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # File Upload
    max_file_size: int = 10485760  # 10MB
    evidence_dir: str = "./evidence"
    models_dir: str = "./models"
    base_dir: str = "."
    
    # AI Model Service
    model_api_url: str = "http://localhost:8001"  # URL where model API is running
    model_timeout: int = 30  # Timeout in seconds for model inference
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
