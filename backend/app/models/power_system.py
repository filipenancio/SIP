from pydantic import BaseModel
from typing import List

class Bus(BaseModel):
    id: int
    type: int
    Pd: float
    Qd: float
    Vm: float
    Va: float

class Line(BaseModel):
    from_bus: int
    to_bus: int
    r: float
    x: float
    b: float

class PowerSystem(BaseModel):
    baseMVA: float
    buses: List[Bus]
    lines: List[Line]
