import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.power_system_input import PowerSystemInput
from app.models.power_system_results import PowerSystemResult
import pandapower as pp
from pandapower.converter.matpower import from_mpc
from app.utils.parser import matpower_to_power_system_input


client = TestClient(app)

def test_simulation_success():
    # Sistema de 3 barras com valores que convergem
    payload = {
        "baseMVA": 100.0,
        "buses": [
            {
                "id": 0,
                "type": 3,
                "Pd": 0.0,
                "Qd": 0.0,
                "Gs": 0,
                "Bs": 0,
                "area": 1,
                "Vm": 1.05,
                "Va": 0.0,
                "base_kv": 230.0,
                "zone": 1,
                "vm_max": 1.1,
                "vm_min": 0.9
            },
            {
                "id": 1,
                "type": 1,
                "Pd": 40.0,
                "Qd": 20.0,
                "Gs": 0,
                "Bs": 0,
                "area": 1,
                "Vm": 1.0,
                "Va": 0.0,
                "base_kv": 230.0,
                "zone": 1,
                "vm_min": 0.9,
                "vm_max": 1.1
            },
            {
                "id": 2,
                "type": 2,
                "Pd": 25.0,
                "Qd": 15.0,
                "Gs": 0,
                "Bs": 0,
                "area": 1,
                "Vm": 1.04,
                "Va": 0.0,
                "base_kv": 230.0,
                "zone": 1,
                "vm_min": 0.9,
                "vm_max": 1.1
            }
        ],
        "generators": [
            {
                "bus": 2,
                "p_mw": 35.0,
                "q_mvar": 0.0,
                "qmax": 100.0,
                "qmin": -100.0,
                "vm_pu": 1.02,
                "mBase": 100.0,
                "status": 1,
                "Pmax": 50.0,
                "Pmin": 0.0,
                "Pc1": 0.0,
                "Pc2": 0.0,
                "Qc1min": 0.0,
                "Qc1max": 0.0,
                "Qc2min": 0.0,
                "Qc2max": 0.0,
                "ramp_agc": 0.0,
                "ramp_10": 0.0,
                "ramp_30": 0.0,
                "ramp_q": 0.0,
                "apf": 0.0
            },
            {
                "bus": 0,
                "p_mw": 0.0,
                "q_mvar": 0.0,
                "qmax": 100.0,
                "qmin": -100.0,
                "vm_pu": 1.0,
                "mBase": 100.0,
                "status": 1,
                "Pmax": 0.0,
                "Pmin": 0.0,
                "Pc1": 0.0,
                "Pc2": 0.0,
                "Qc1min": 0.0,
                "Qc1max": 0.0,
                "Qc2min": 0.0,
                "Qc2max": 0.0,
                "ramp_agc": 0.0,
                "ramp_10": 0.0,
                "ramp_30": 0.0,
                "ramp_q": 0.0,
                "apf": 0.0
            }
        ],
        "lines": [
            {
                "from_bus": 0,
                "to_bus": 1,
                "r": 0.01,
                "x": 0.06,
                "b": 0.03,
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 0.0,
                "angle": 0.0,
                "status": 1,
                "angmin": -360.0,
                "angmax": 360.0
            },
            {
                "from_bus": 0,
                "to_bus": 2,
                "r": 0.02,
                "x": 0.08,
                "b": 0.025,
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 0.0,
                "angle": 0.0,
                "status": 1,
                "angmin": -360.0,
                "angmax": 360.0
            },
            {
                "from_bus": 1,
                "to_bus": 2,
                "r": 0.015,
                "x": 0.07,
                "b": 0.02,
                "rateA": 250.0,
                "rateB": 250.0,
                "rateC": 250.0,
                "ratio": 0.0,
                "angle": 0.0,
                "status": 1,
                "angmin": -360.0,
                "angmax": 360.0
            }
        ],
        "version": "2",
        "name": "case3_example"
    }

    # Fazer a requisição POST
    response = client.post("/sip/simulate/", json=payload)
    print(response.json())
    
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
    
    # Verificar número de elementos
    assert len(data["buses"]) == 3
    assert len(data["lines"]) == 3
    
    # Verificar resultados específicos
    buses = data["buses"]
    assert all(0.9 <= bus["vm_pu"] <= 1.1 for bus in buses)  # Verificar se todas as tensões estão dentro dos limites
    
    # Verificar o gerador na barra 3
    generators = data["generators"]
    gen3 = next((g for g in generators if g["bus"] == 3), None)
    assert gen3 is not None
    assert abs(gen3["p_mw"] - 35.0) < 0.1  # Tolerância de 0.1 MW

def test_use_modelo_matpower():
    # Carregar arquivo case3p.m usando pandapower
    file_path = os.path.join(os.path.dirname(__file__), "../data/case3p.m")

    # Extrair apenas o nome do arquivo do caminho
    filename = os.path.basename(file_path)
    # print(f"Usando o arquivo: {filename}")
    # Fazer a requisição GET
    response = client.get(f"/sip/matpower/{filename}")

    # Verificar o status code
    assert response.status_code == 200
    
    # Verificar o conteúdo da resposta
    data = response.json()
    assert "buses" in data
    assert "lines" in data
    assert "loads" in data
    assert "generators" in data
    assert "ext_grid" in data
    
    # Verificar número de elementos
    assert len(data["buses"]) == 3
    assert len(data["lines"]) == 3
    
    # Verificar resultados específicos
    buses = data["buses"]
    assert all(0.9 <= bus["vm_pu"] <= 1.1 for bus in buses)  # Tensões dentro dos limites

def test_upload_matpower():
    # Testar upload de arquivo
    file_path = os.path.join(os.path.dirname(__file__), "../data/case3p.m")
    with open(file_path, "rb") as f:
        files = {"file": ("case3p.m", f, "text/plain")}
        response = client.post("/sip/simulate/matpower/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    # print(data)
    assert len(data["buses"]) == 3
    # Adicionar verificação de tensão
    buses = data["buses"]
    assert all(0.9 <= bus["vm_pu"] <= 1.1 for bus in buses)  # Tensões dentro dos limites

def test_simulation_missing_fields():
    response = client.post("/sip/simulate/", json={})
    assert response.status_code == 422
