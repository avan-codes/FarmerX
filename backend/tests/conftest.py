import json, shutil
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.core.settings import Settings
from app.main import create_app
from app.repositories.config_repository import ConfigRepository
from app.repositories.json_store import JsonStore

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def settings(tmp_path) -> Settings:
    data = tmp_path / "data"
    shutil.copytree(FIXTURES / "config", data / "config")
    shutil.copytree(FIXTURES / "rule_sets", data / "rule_sets")
    (data / "store").mkdir(parents=True)
    return Settings(app_env="test", data_dir=data,
                    config_dir=data / "config", rules_dir=data / "rule_sets")


@pytest.fixture
def client(settings):
    with TestClient(create_app(settings)) as c:
        yield c


@pytest.fixture
def farmer_headers(): return {"X-Farmer-Id": "farmer_A"}

@pytest.fixture
def other_farmer_headers(): return {"X-Farmer-Id": "farmer_B"}


@pytest.fixture
def valid_payload():
    return {
        "soil_values": {"N": 100, "P": 20, "K": 150, "pH": 6.8, "OC": 0.4},
        "crop_id": "testcrop", "region_id": "TESTREGION", "stage_id": "basal",
        "area": {"value": 2, "unit": "acre"}, "language": "en",
    }


@pytest.fixture
def config(settings) -> ConfigRepository:
    repo = ConfigRepository(settings.config_dir)
    repo.load()
    return repo


@pytest.fixture
def store(settings) -> JsonStore:
    return JsonStore(settings.store_dir, settings.file_lock_timeout)


@pytest.fixture
def market_service(settings, store):
    from app.services.market_service import MarketService
    return MarketService(provider=None, store=store, settings=settings)


@pytest.fixture
def news_service(settings, store, config):
    from app.services.news_service import NewsService
    return NewsService(provider=None, store=store, config=config,
                       settings=settings)


@pytest.fixture
def rec(config):
    return {
        "recommendation_id": "rec_test",
        "user_id": "farmer_A",
        "status": "ok",
        "input_hash": "sha256:abc",
        "context": {"crop": "testcrop", "region": "TESTREGION",
                    "stage": "basal",
                    "farm_area": {"value": "2", "unit": "acre"},
                    "language": "en"},
        "soil_parameters": [{"param": "N", "value": "100", "unit": "kg/ha",
                             "category": "low"}],
        "items": [{
            "fertilizer": {"id": "urea", "name": "Urea"},
            "quantity": {"value": "100", "unit": "kg", "display": "100 kg"},
            "quantity_breakdown": {"dose_per_basis": "50", "basis": "per_acre",
                                   "raw_quantity": "100", "unit": "kg"},
            "timing": "basal", "timing_label": "Basal",
            "method": "broadcast", "method_label": "Broadcast",
            "reason": "N is low.", "cautions": [], "source": {},
        }],
        "cautions": [],
        "disclaimer": "Calculated from validated rules.",
        "message": None,
    }