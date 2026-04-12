from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models import compatibility as compatibility_model  # noqa: F401
from app.models import mod_part as mod_part_model  # noqa: F401
from app.models import motorcycle as motorcycle_model  # noqa: F401
from app.routers import motorcycles, parts, quotes
from app.utils.exceptions import register_exception_handlers
from app.utils.logger import register_request_logging


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="MotoForge API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_request_logging(app)
register_exception_handlers(app)

app.include_router(motorcycles.router, prefix="/api")
app.include_router(parts.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
