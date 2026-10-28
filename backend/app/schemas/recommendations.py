from decimal import Decimal
from pydantic import BaseModel, Field, model_validator

from app.schemas.common import Area


class RecommendationCreate(BaseModel):
    report_id: str | None = None
    soil_values: dict[str, Decimal] | None = None
    crop_id: str
    region_id: str
    stage_id: str
    district: str | None = None
    area: Area
    language: str = "en"
    farm_id: str | None = None

    @model_validator(mode="after")
    def exactly_one_source(self):
        if bool(self.report_id) == bool(self.soil_values):
            raise ValueError("Provide exactly one of 'report_id' or 'soil_values'.")
        return self