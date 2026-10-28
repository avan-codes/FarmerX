from decimal import Decimal
from pydantic import BaseModel, Field


class Area(BaseModel):
    value: Decimal = Field(gt=0)
    unit: str


class ListEnvelope(BaseModel):
    items: list
    page: int
    page_size: int
    total: int