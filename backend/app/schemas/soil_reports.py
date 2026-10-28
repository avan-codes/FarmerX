from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class SoilReportCreate(BaseModel):
    farm_id: str | None = None
    values: dict[str, Decimal]
    source: str = "manual"
    captured_at: datetime | None = None


class SoilReport(BaseModel):
    report_id: str
    display_ref: str
    user_id: str
    farm_id: str | None
    values: dict[str, Decimal]
    source: str
    upload_ref: str | None
    captured_at: str
    created_at: str