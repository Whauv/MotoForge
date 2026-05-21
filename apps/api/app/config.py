from __future__ import annotations

import json
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(
        default="sqlite:///./motoforge.db",
        alias="DATABASE_URL",
    )
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        alias="CORS_ORIGINS",
    )
    app_env: str = Field(default="development", alias="APP_ENV")
    motorcycle_catalog_provider: str = Field(
        default="local",
        alias="MOTORCYCLE_CATALOG_PROVIDER",
    )
    motormanage_api_key: str = Field(default="", alias="MOTORMANAGE_API_KEY")
    motormanage_base_url: str = Field(
        default="https://motorapi.motormanage.app/api/v1",
        alias="MOTORMANAGE_BASE_URL",
    )
    catalog_cache_ttl_seconds: int = Field(
        default=86400,
        alias="CATALOG_CACHE_TTL_SECONDS",
    )
    api_request_timeout_seconds: int = Field(
        default=30,
        alias="API_REQUEST_TIMEOUT_SECONDS",
    )
    api_rate_limit_per_minute: int = Field(
        default=180,
        alias="API_RATE_LIMIT_PER_MINUTE",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        if value is None or value == "":
            return ["http://localhost:3000"]
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                if not isinstance(parsed, list):
                    raise ValueError(
                        "CORS_ORIGINS must be a JSON array or comma-separated string."
                    )
                return [str(item) for item in parsed]
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        raise ValueError("Unsupported CORS_ORIGINS format.")


settings = Settings()
