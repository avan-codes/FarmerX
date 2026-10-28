from fastapi import APIRouter, Depends, Query
from app.api.deps import get_config
from app.core.errors import ApiError, ErrorCode

router = APIRouter(prefix="/config", tags=["config"])


def _ok(rows): return {"items": rows, "total": len(rows)}


@router.get("/crops")
async def crops(config=Depends(get_config)):
    return _ok(list(config.crops.values()))


@router.get("/regions")
async def regions(config=Depends(get_config)):
    return _ok(list(config.regions.values()))


@router.get("/stages")
async def stages(crop_id: str = Query(...), region_id: str = Query(...),
                 config=Depends(get_config)):
    if crop_id not in config.crops:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Invalid crop_id", crop_id)
    if region_id not in config.regions:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Invalid region_id", region_id)
    return _ok(config.stages_for(crop_id, region_id))


@router.get("/units")
async def units(config=Depends(get_config)):
    doc = config.units
    return _ok([{"kind": "area", **u} for u in doc._area.values()]
               + [{"kind": "quantity", **u} for u in doc._quantity.values()])


@router.get("/languages")
async def languages(config=Depends(get_config)):
    return _ok(list(config.languages))


@router.get("/fertilizers")
async def fertilizers(config=Depends(get_config)):
    return _ok(list(config.fertilizers.values()))


@router.get("/soil-parameters")
async def soil_parameters(config=Depends(get_config)):
    return _ok([{
        "id": p["id"], "label_key": p.get("label_key", p["id"]),
        "unit": p["unit"], "min": p["min"], "max": p["max"],
        "required": p.get("required", False),
    } for p in config.soil_parameters.values()])