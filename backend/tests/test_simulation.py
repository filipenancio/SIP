import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def sample_payload():
    return {
        "buses": [
            {"bus": 0, "vn_kv": 110.0, "name": "Slack Bus", "type": "slack", "p_mw": 0.0, "q_mvar": 0.0},
            {"bus": 1, "vn_kv": 110.0, "name": "Load Bus", "type": "load", "p_mw": 20.0, "q_mvar": 5.0},
            {"bus": 2, "vn_kv": 110.0, "name": "Gen Bus", "type": "gen", "p_mw": 30.0, "q_mvar": 10.0}
        ],
        "lines": [
            {"from_bus": 0, "to_bus": 1, "length_km": 10.0, "r_ohm_per_km": 0.1, "x_ohm_per_km": 0.2},
            {"from_bus": 1, "to_bus": 2, "length_km": 10.0, "r_ohm_per_km": 0.1, "x_ohm_per_km": 0.2},
            {"from_bus": 2, "to_bus": 0, "length_km": 10.0, "r_ohm_per_km": 0.1, "x_ohm_per_km": 0.2}
        ]
    }

def test_simulation_success(sample_payload):
    response = client.post("/simulate", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert "buses" in data
    assert "lines" in data
    assert isinstance(data["buses"], list)
    assert isinstance(data["lines"], list)
    assert len(data["buses"]) == 3
    assert len(data["lines"]) == 3

def test_simulation_missing_fields():
    response = client.post("/simulate", json={})
    assert response.status_code == 422
