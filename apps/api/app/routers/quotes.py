from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.quote import QuoteRequest, QuoteResponse
from app.services.quote_service import calculate_quote

router = APIRouter(tags=["quotes"])


@router.post("/quote", response_model=QuoteResponse)
def create_quote(payload: QuoteRequest, db: Session = Depends(get_db)) -> QuoteResponse:
    return calculate_quote(db, payload.motorcycle_id, payload.selected_part_ids)
