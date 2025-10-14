from pydantic import BaseModel
from typing import List, Optional

class Bus(BaseModel):
    id: int
    type: int  # 1-PQ, 2-PV, 3-Slack
    Pd: float = 0.0
    Qd: float = 0.0
    Gs: float = 0.0
    Bs: float = 0.0
    area: int = 1
    Vm: float = 1.0
    Va: float = 0.0
    base_kv: float
    zone: int = 1
    vm_max: float = 1.1
    vm_min: float = 0.9

class Load(BaseModel):
    bus: int
    p_mw: float
    q_mvar: float
    scaling: float = 1.0
    in_service: bool = True

class Generator(BaseModel):
    bus: int
    pg: float
    qg: float = 0.0
    qmax: float = 100.0
    qmin: float = -100.0
    Vg: float = 1.0
    mBase: float = 100.0
    status: int = 1
    Pmax: float = 100.0
    Pmin: float = 0.0
    Pc1: float = 0.0
    Pc2: float = 0.0
    Qc1min: float = 0.0
    Qc1max: float = 0.0
    Qc2min: float = 0.0
    Qc2max: float = 0.0
    ramp_agc: float = 0.0
    ramp_10: float = 0.0
    ramp_30: float = 0.0
    ramp_q: float = 0.0
    apf: float = 0.0

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
    ratio: float = 0.0
    angle: float = 0.0
    status: int = 1
    angmin: float = -360.0
    angmax: float = 360.0

class PowerSystemInput(BaseModel):
    baseMVA: float
    buses: List[Bus]
    generators: List[Generator]
    lines: List[Line]
    loads: Optional[List[Load]] = []
    ext_grid: Optional[ExtGrid] = None
    version: Optional[str] = "2"
    name: Optional[str] = None