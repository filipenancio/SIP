import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.power_system_input import PowerSystemInput
from app.models.power_system_results import PowerSystemResult

client = TestClient(app)

def test_simulation_success():
    # Sistema de 3 barras com valores que convergem
    payload = {
        "baseMVA": 100.0,
        "buses": [
            {
                "id": 1,
                "type": 3,  # Slack bus
                "Pd": 0.0,  # Sem carga
                "Qd": 0.0,
                "Vm": 1.05,  # Tensão controlada
                "Va": 0.0,   # Ângulo de referência
                "area": 1,
                "vm_min": 0.9,
                "vm_max": 1.1,
                "base_kv": 230.0
            },
            {
                "id": 2,
                "type": 1,  # PQ bus
                "Pd": 40.0,  # Carga moderada
                "Qd": 20.0,
                "Vm": 1.0,
                "Va": 0.0,
                "area": 1,
                "vm_min": 0.9,
                "vm_max": 1.1,
                "base_kv": 230.0
            },
            {
                "id": 3,
                "type": 2,  # PV bus
                "Pd": 25.0,  # Carga menor
                "Qd": 15.0,
                "Vm": 1.04,  # Tensão controlada
                "Va": 0.0,
                "area": 1,
                "vm_min": 0.9,
                "vm_max": 1.1,
                "base_kv": 230.0
            }
        ],
        "loads": [
            {
                "bus": 2,
                "p_mw": 40.0,
                "q_mvar": 20.0,
                "scaling": 1.0,
                "in_service": True
            },
            {
                "bus": 3,
                "p_mw": 25.0,
                "q_mvar": 15.0,
                "scaling": 1.0,
                "in_service": True
            }
        ],
        "generators": [
            {
                "bus": 3,
                "p_mw": 0.0,
                "vm_pu": 1.04,
                "scaling": 1.0,
                "in_service": True
            }
        ],
        "ext_grid": {
            "bus": 1,
            "vm_pu": 1.05,
            "va_degree": 0.0,
            "in_service": True
        },
        "lines": [
            {
                "from_bus": 1,
                "to_bus": 2,
                "r": 0.01,
                "x": 0.06,
                "b": 0.030,
                "rateA": 250.0,
                "status": 1
            },
            {
                "from_bus": 1,
                "to_bus": 3,
                "r": 0.02,
                "x": 0.08,
                "b": 0.025,
                "rateA": 250.0,
                "status": 1
            },
            {
                "from_bus": 2,
                "to_bus": 3,
                "r": 0.015,
                "x": 0.07,
                "b": 0.020,
                "rateA": 250.0,
                "status": 1
            }
        ],
        "version": "2",
        "name": "case3_example"
    }

    # Fazer a requisição POST
    response = client.post("/simulate", json=payload)
    
    # Verificar o status code
    assert response.status_code == 200
    
    # Verificar o conteúdo da resposta
    data = response.json()
    ## print(data)
    assert "buses" in data
    assert "lines" in data
    assert "loads" in data
    assert "generators" in data
    assert "ext_grid" in data
    
    # Verificar a estrutura dos dados
    assert isinstance(data["buses"], list)
    assert isinstance(data["lines"], list)
    assert len(data["buses"]) == 3
    assert len(data["lines"]) == 3
    
    # Verificar resultados específicos
    buses = data["buses"]
    assert not all(0.9 <= bus["vm_pu"] <= 1.1 for bus in buses)  # tensões fora dos limites

def test_simulation_missing_fields():
    response = client.post("/simulate", json={})
    assert response.status_code == 422
