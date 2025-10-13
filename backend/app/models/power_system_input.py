from pydantic import BaseModel
from typing import List, Optional

class Bus(BaseModel):
    id: int
    type: int  # 1-PQ, 2-PV, 3-Slack
    Pd: float
    Qd: float
    Vm: float
    Va: float
    area: int
    vm_min: float
    vm_max: float
    base_kv: float

class Load(BaseModel):
    bus: int
    p_mw: float
    q_mvar: float
    scaling: float = 1.0
    in_service: bool = True

class Generator(BaseModel):
    bus: int
    p_mw: float
    vm_pu: float
    scaling: float = 1.0
    in_service: bool = True
    max_q_mvar: Optional[float] = None
    min_q_mvar: Optional[float] = None

class ExtGrid(BaseModel):
    bus: int
    vm_pu: float
    va_degree: float
    in_service: bool = True

class Line(BaseModel):
    from_bus: int
    to_bus: int
    r: float
    x: float
    b: float
    rateA: float
    rateB: float = 0.0
    rateC: float = 0.0
    ratio: float = 1.0
    angle: float = 0.0
    status: int = 1

class PowerSystemInput(BaseModel):
    baseMVA: float
    buses: List[Bus]
    loads: List[Load]
    generators: List[Generator]
    ext_grid: ExtGrid
    lines: List[Line]
    version: str
    name: str