import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

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
        "lines": [
            {
                "from_bus": 1,
                "to_bus": 2,
                "r": 0.01,    # Resistência pequena
                "x": 0.06,    # Reatância típica
                "b": 0.030,   # Susceptância moderada
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 1.0,
                "angle": 0.0,
                "status": 1
            },
            {
                "from_bus": 1,
                "to_bus": 3,
                "r": 0.02,
                "x": 0.08,
                "b": 0.025,
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 1.0,
                "angle": 0.0,
                "status": 1
            },
            {
                "from_bus": 2,
                "to_bus": 3,
                "r": 0.015,
                "x": 0.07,
                "b": 0.020,
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 1.0,
                "angle": 0.0,
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
    print(data)
    assert "buses" in data
    assert "lines" in data
    
    # Verificar a estrutura dos dados
    assert isinstance(data["buses"], list)
    assert isinstance(data["lines"], list)
    assert len(data["buses"]) == 3
    assert len(data["lines"]) == 3
    
    # Verificar resultados específicos
    buses = data["buses"]
    assert any(bus["type"] == 3 for bus in buses)  # deve ter uma barra slack
    assert any(bus["type"] == 2 for bus in buses)  # deve ter uma barra PV
    assert all(0.9 <= bus["Vm"] <= 1.1 for bus in buses)  # tensões dentro dos limites

def test_simulation_missing_fields():
    response = client.post("/simulate", json={})
    assert response.status_code == 422
