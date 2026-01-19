import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_allow_origins: list[str]
    use_openai_analysis: bool
    openai_api_key: str | None
    openai_model: str


def _parse_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def load_settings() -> Settings:
    cors_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///./meals.db"),
        cors_allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
        use_openai_analysis=_parse_bool(os.getenv("USE_OPENAI_ANALYSIS", "false")),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    )


settings = load_settings()
