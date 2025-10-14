from fastapi import APIRouter, HTTPException, UploadFile, File, Path
import os
from typing import List
from app.models.power_system_input import PowerSystemInput, Load, ExtGrid
from app.models.power_system_results import PowerSystemResult
from app.services.matpower_service import MatpowerService
from app.services.power_flow import simulate_power_flow

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
async def run_simulation(system: PowerSystemInput):
    """
    Executa simulação de fluxo de potência a partir de dados JSON.
    
    Args:
        system (PowerSystemInput): Dados do sistema elétrico no formato JSON
        
    Returns:
        PowerSystemResult: Resultados da simulação do fluxo de potência
    """
    try:
        # Verificar se tem barra slack
        has_slack = any(bus.type == 3 for bus in system.buses)
        if not has_slack:
            raise ValueError("O sistema deve ter uma barra slack (type=3)")
            
        # Verificar se cargas estão corretas
        for bus in system.buses:
            if bus.Pd != 0 or bus.Qd != 0:
                # Adicionar carga da barra à lista de cargas
                system.loads.append(Load(
                    bus=bus.id,
                    p_mw=bus.Pd,
                    q_mvar=bus.Qd,
                    scaling=1.0,
                    in_service=True
                ))
                
        # Configurar ext_grid para a barra slack se não existir
        if system.ext_grid is None:
            slack_bus = next(bus.id for bus in system.buses if bus.type == 3)
            slack_gen = next((gen for gen in system.generators if gen.bus == slack_bus), None)
            
            if slack_gen:
                system.ext_grid = ExtGrid(
                    bus=slack_bus,
                    vm_pu=slack_gen.Vg,
                    va_degree=0.0,
                    in_service=bool(slack_gen.status)
                )
            else:
                slack_bus_data = next(bus for bus in system.buses if bus.type == 3)
                system.ext_grid = ExtGrid(
                    bus=slack_bus_data.id,
                    vm_pu=slack_bus_data.Vm,
                    va_degree=slack_bus_data.Va,
                    in_service=True
                )
                
        return simulate_power_flow(system)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
