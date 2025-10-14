from typing import Dict, Any
import pandapower as pp
from app.models.power_system_input import (
    PowerSystemInput, Bus, Load, Generator, ExtGrid, Line
)
from app.models.power_system_results import (
    PowerSystemResult, BusResult, LoadResult, GeneratorResult, ExtGridResult, LineResult
)

def matpower_to_power_system_input(net: pp.pandapowerNet) -> PowerSystemInput:
    """
    Converte uma rede pandapower (carregada do MATPOWER) para PowerSystemInput
    """
    # Criar dicionário de tipos de barra
    bus_types = {}
    for i, bus in net.bus.iterrows():
        if i in net.ext_grid.bus.values:
            bus_types[i] = 3  # Slack
        elif i in net.gen.bus.values:
            bus_types[i] = 2  # PV
        else:
            bus_types[i] = 1  # PQ

    # Converter barras
    buses = [
        Bus(
            id=int(i + 1),
            type=bus_types[i],
            Pd=float(net.load.p_mw[net.load.bus == i].sum() if not net.load.empty else 0.0),
            Qd=float(net.load.q_mvar[net.load.bus == i].sum() if not net.load.empty else 0.0),
            Vm=1.0 if i not in net.ext_grid.bus.values and i not in net.gen.bus.values 
                else (float(net.ext_grid.vm_pu[net.ext_grid.bus == i].iloc[0]) if i in net.ext_grid.bus.values 
                      else float(net.gen.vm_pu[net.gen.bus == i].iloc[0])),
            Va=0.0 if i not in net.ext_grid.bus.values 
                else float(net.ext_grid.va_degree[net.ext_grid.bus == i].iloc[0]),
            area=1,
            vm_min=0.9,
            vm_max=1.1,
            base_kv=float(bus['vn_kv'])
        )
        for i, bus in net.bus.iterrows()
    ]

    # Converter cargas
    loads = [
        Load(
            bus=int(load.bus + 1),
            p_mw=float(load.p_mw),
            q_mvar=float(load.q_mvar),
            scaling=float(load.scaling),
            in_service=bool(load.in_service)
        )
        for _, load in net.load.iterrows()
    ] if not net.load.empty else []

    # Converter geradores
    generators = [
        Generator(
            bus=int(gen.bus + 1),
            p_mw=float(gen.p_mw),
            vm_pu=float(gen.vm_pu),
            scaling=float(gen.scaling),
            in_service=bool(gen.in_service)
        )
        for _, gen in net.gen.iterrows()
    ] if not net.gen.empty else []

    # Converter barra slack
    ext_grid = ExtGrid(
        bus=int(net.ext_grid.bus.iloc[0] + 1),
        vm_pu=float(net.ext_grid.vm_pu.iloc[0]),
        va_degree=float(net.ext_grid.va_degree.iloc[0]),
        in_service=bool(net.ext_grid.in_service.iloc[0])
    )

    # Converter linhas
    lines = [
        Line(
            from_bus=int(line.from_bus + 1),
            to_bus=int(line.to_bus + 1),
            r=float(line.r_ohm_per_km),
            x=float(line.x_ohm_per_km),
            b=float(line.c_nf_per_km) / 1e9,
            rateA=float(line.max_i_ka * net.bus.vn_kv.iloc[0] if 'max_i_ka' in line else 250.0),
            status=int(line.in_service)
        )
        for _, line in net.line.iterrows()
    ]

    return PowerSystemInput(
        baseMVA=net.sn_mva,
        buses=buses,
        loads=loads,
        generators=generators,
        ext_grid=ext_grid,
        lines=lines,
        version="2",
        name="personalized_case"
    )

def _convert_results(self, net: pp.pandapowerNet) -> PowerSystemResult:
    """Converte os resultados do pandapower para nosso formato"""
    from app.models.power_system_results import (
        BusResult, LineResult, LoadResult, 
        GeneratorResult, ExtGridResult, PowerSystemResult
    )
    
    # Converter resultados das barras
    buses = [
        BusResult(
            bus_id=int(i),
            Vm=float(net.res_bus.vm_pu[i]),  # Mudado de vm_pu para Vm
            Va=float(net.res_bus.va_degree[i]),  # Mudado de va_degree para Va
            p_mw=float(net.res_bus.p_mw[i]),
            q_mvar=float(net.res_bus.q_mvar[i])
        )
        for i in range(len(net.bus))
    ]
    
    # Converter resultados das linhas
    lines = [
        LineResult(
            from_bus=int(line.from_bus + 1),
            to_bus=int(line.to_bus + 1),
            p_mw=float(line.p_mw),
            q_mvar=float(line.q_mvar),
            status=int(line.in_service)
        )
        for _, line in net.line.iterrows()
    ]
    
    # Converter resultados das cargas
    loads = [
        LoadResult(
            bus=int(load.bus + 1),
            p_mw=float(load.p_mw),
            q_mvar=float(load.q_mvar),
            scaling=float(load.scaling),
            in_service=bool(load.in_service)
        )
        for _, load in net.load.iterrows()
    ] if not net.load.empty else []

    # Converter resultados dos geradores
    generators = [
        GeneratorResult(
            bus=int(gen.bus + 1),
            p_mw=float(gen.p_mw),
            vm_pu=float(gen.vm_pu),
            scaling=float(gen.scaling),
            in_service=bool(gen.in_service)
        )
        for _, gen in net.gen.iterrows()
    ] if not net.gen.empty else []

    # Converter resultados da barra slack
    ext_grid = ExtGridResult(
        bus=int(net.ext_grid.bus.iloc[0] + 1),
        vm_pu=float(net.ext_grid.vm_pu.iloc[0]),
        va_degree=float(net.ext_grid.va_degree.iloc[0]),
        in_service=bool(net.ext_grid.in_service.iloc[0])
    )

    return PowerSystemResult(
        buses=buses,
        lines=lines,
        loads=loads,
        generators=generators,
        ext_grid=ext_grid,
        version="2",
        name="personalized_case"
    )
