from fastapi import APIRouter, HTTPException, UploadFile, File, Path
import os
from typing import List
from app.models.power_system_input import PowerSystemInput, Load, ExtGrid, Bus, Generator, Line
from app.models.power_system_results import PowerSystemResult
from app.services.matpower_service import MatpowerService
from app.services.power_flow import simulate_power_flow
from app.utils.parser import matpower_to_power_system_input

router = APIRouter()
matpower_service = MatpowerService()

@router.get("/matpower/files", response_model=List[str])
async def list_matpower_files():
    """
    Lista todos os arquivos MATPOWER disponíveis no sistema.
    
    Returns:
        List[str]: Lista de nomes dos arquivos .m disponíveis
    """
    try:
        return matpower_service.list_available_files()
    except ValueError as e:
        # Erro de validação ou arquivo não encontrado
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Outros erros inesperados
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.get("/matpower/{filename}", response_model=PowerSystemResult)
async def simulate_matpower_filename(
    filename: str = Path(
        ..., 
        description="Nome do arquivo MATPOWER (ex: case3p.m, case4gs.m, case5.m, case6ww.m, case9.m, case14.m)",
        examples={"default": {"value": "case3p.m"}}
    )
):
    """
    Simula um sistema a partir de um arquivo MATPOWER pré carregado.
    
    Args:
        filename (str): Nome do arquivo MATPOWER a ser simulado
        
    Returns:
        PowerSystemResult: Resultados da simulação do fluxo de potência
    """
    try:
        return matpower_service.simulate_from_filename(filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate", response_model=PowerSystemResult)
async def run_simulation(data: dict):
    """
    Executa simulação de fluxo de potência a partir de dados JSON.
    
    Args:
        data (dict): Dados do sistema elétrico no formato MATPOWER
        
    Returns:
        PowerSystemResult: Resultados da simulação do fluxo de potência
    """
    try:
        # Converter dados do formato MATPOWER para PowerSystemInput
        parsed_system = matpower_to_power_system_input(data)
        
        # Verificar se tem barra slack
        has_slack = any(bus.type == 3 for bus in parsed_system.buses)
        if not has_slack:
            raise ValueError("O sistema deve ter uma barra slack (type=3)")

        return simulate_power_flow(parsed_system)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate/matpower/upload", response_model=PowerSystemResult)
async def simulate_matpower_upload(
    file: UploadFile = File(..., description="Arquivo MATPOWER (.m)")
):
    """
    Simula um sistema a partir de um arquivo MATPOWER enviado.
    
    Args:
        file (UploadFile): Arquivo MATPOWER a ser simulado
        
    Returns:
        PowerSystemResult: Resultados da simulação do fluxo de potência
    """
    try:
        content = await file.read()
        return matpower_service.simulate_from_string(content.decode())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
