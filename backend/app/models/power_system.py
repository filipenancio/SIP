from pydantic import BaseModel
from typing import List

class Bus(BaseModel):
    id: int
    type: int  # bus type (1-PQ, 2-PV, 3-Slack)
    Pd: float  # active power demand [MW]
    Qd: float  # reactive power demand [MVar]
    Vm: float  # voltage magnitude [p.u.]
    Va: float  # voltage angle [degrees]
    area: int  # area number
    vm_min: float  # minimum voltage magnitude [p.u.]
    vm_max: float  # maximum voltage magnitude [p.u.]
    base_kv: float  # base voltage [kV]

class Line(BaseModel):
    from_bus: int  # from bus number
    to_bus: int    # to bus number
    r: float       # resistance [p.u.]
    x: float       # reactance [p.u.]
    b: float       # total line charging susceptance [p.u.]
    rateA: float   # MVA rating A (long term rating)
    rateB: float   # MVA rating B (short term rating)
    rateC: float   # MVA rating C (emergency rating)
    ratio: float   # transformer off nominal turns ratio
    angle: float   # transformer phase shift angle
    status: int    # initial branch status, 1 - in service, 0 - out of service

class PowerSystem(BaseModel):
    baseMVA: float  # system MVA base
    buses: List[Bus]
    lines: List[Line]
    version: str    # version of MATPOWER case format
    name: str       # name of the test case
