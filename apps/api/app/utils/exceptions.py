from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


def error_payload(
    request: Request,
    *,
    code: str,
    message: str,
) -> dict[str, str]:
    request_id = getattr(request.state, "request_id", "")
    return {"code": code, "message": message, "request_id": request_id}


class BikeNotFound(Exception):
    def __init__(self, motorcycle_id: int):
        self.motorcycle_id = motorcycle_id
        super().__init__(f"Motorcycle with id {motorcycle_id} was not found.")


class PartNotFound(Exception):
    def __init__(self, part_id: int):
        self.part_id = part_id
        super().__init__(f"Part with id {part_id} was not found.")


class IncompatiblePart(Exception):
    def __init__(self, motorcycle_id: int, part_ids: list[int]):
        self.motorcycle_id = motorcycle_id
        self.part_ids = part_ids
        joined_ids = ", ".join(str(part_id) for part_id in part_ids)
        super().__init__(
            f"Part id(s) {joined_ids} are not compatible with motorcycle id "
            f"{motorcycle_id}."
        )


async def bike_not_found_handler(request: Request, exc: BikeNotFound) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content=error_payload(
            request,
            code="bike_not_found",
            message=str(exc),
        ),
    )


async def part_not_found_handler(request: Request, exc: PartNotFound) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content=error_payload(
            request,
            code="part_not_found",
            message=str(exc),
        ),
    )


async def incompatible_part_handler(
    request: Request,
    exc: IncompatiblePart,
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=error_payload(
            request,
            code="incompatible_part",
            message=str(exc),
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(BikeNotFound, bike_not_found_handler)
    app.add_exception_handler(PartNotFound, part_not_found_handler)
    app.add_exception_handler(IncompatiblePart, incompatible_part_handler)
