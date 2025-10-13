from fastapi import APIRouter, HTTPException
from app.models.power_system import PowerSystem
from app.services.power_flow import simulate_power_flow

router = APIRouter()

@router.post("/")
async def run_simulation(system: PowerSystem):
    try:
        result = simulate_power_flow(system)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in simulation: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))
