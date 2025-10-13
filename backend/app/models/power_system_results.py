from pydantic import BaseModel
from typing import List

class BusResult(BaseModel):
    bus_id: int
    vm_pu: float
    va_degree: float
    p_mw: float
    q_mvar: float

class LineResult(BaseModel):
    from_bus: int
    to_bus: int
    p_from_mw: float
    q_from_mvar: float
    p_to_mw: float
    q_to_mvar: float
    pl_mw: float
    ql_mvar: float
    i_ka: float
    loading_percent: float
    in_service: bool

class LoadResult(BaseModel):
    bus_id: int
    p_mw: float
    q_mvar: float
    scaling: float

class GeneratorResult(BaseModel):
    bus_id: int
    p_mw: float
    q_mvar: float
    vm_pu: float
    in_service: bool

class ExtGridResult(BaseModel):
    bus_id: int
    p_mw: float
    q_mvar: float

class PowerSystemResult(BaseModel):
    buses: List[BusResult]
    lines: List[LineResult]
    loads: List[LoadResult]
    generators: List[GeneratorResult]
    ext_grid: ExtGridResult