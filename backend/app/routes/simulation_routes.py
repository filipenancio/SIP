from fastapi import APIRouter
from app.models.power_system import PowerSystem
from app.services.simulation_service import run_power_flow

router = APIRouter()

@router.post("/")
def simulate(system: PowerSystem):
    result = run_power_flow(system)
    return result
