import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.power_system_results import PowerSystemResult
import pandapower as pp
from pandapower.converter.matpower import from_mpc

client = TestClient(app)

def test_use_modelo_matpower():
    # Carregar arquivo case3p.m usando pandapower
    file_path = os.path.join(os.path.dirname(__file__), "../data/case3p.m")

    # Extrair apenas o nome do arquivo do caminho
    filename = os.path.basename(file_path)
    # print(f"Usando o arquivo: {filename}")
    # Fazer a requisição GET
    response = client.get(f"/sisep/matpower/{filename}")

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
        response = client.post("/sisep/simulate/matpower/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    # print(data)
    assert len(data["buses"]) == 3
    # Adicionar verificação de tensão
    buses = data["buses"]
    assert all(0.9 <= bus["vm_pu"] <= 1.1 for bus in buses)  # Tensões dentro dos limites
