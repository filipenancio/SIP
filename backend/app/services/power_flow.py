import pandapower as pp
import numpy as np
from app.models.power_system_input import (
    PowerSystemInput, Bus, Load, Generator, ExtGrid, Line
)
from app.models.power_system_results import (
    PowerSystemResult, BusResult, LineResult, 
    LoadResult, GeneratorResult, ExtGridResult
)
from pandapower.powerflow import LoadflowNotConverged

def simulate_power_flow(system: PowerSystemInput) -> PowerSystemResult:
    try:
        # Criar rede pandapower
        net = pp.create_empty_network(sn_mva=system.baseMVA)
        
        # Mapear IDs das barras
        bus_indices = {}
        
        # Adicionar barras
        for bus in system.buses:
            idx = pp.create_bus(
                net,
                vn_kv=bus.base_kv,
                min_vm_pu=bus.vm_min,
                max_vm_pu=bus.vm_max
            )
            bus_indices[bus.id] = idx
        
        # Adicionar cargas
        for load in system.loads:
            pp.create_load(
                net,
                bus=bus_indices[load.bus],
                p_mw=load.p_mw,
                q_mvar=load.q_mvar,
                scaling=load.scaling,
                in_service=load.in_service
            )
        
        # Adicionar geradores
        for gen in system.generators:
            pp.create_gen(
                net,
                bus=bus_indices[gen.bus],
                p_mw=gen.p_mw,
                vm_pu=gen.vm_pu,
                scaling=gen.scaling,
                in_service=gen.in_service,
                max_q_mvar=gen.max_q_mvar,
                min_q_mvar=gen.min_q_mvar
            )
        
        # Adicionar barra slack
        pp.create_ext_grid(
            net,
            bus=bus_indices[system.ext_grid.bus],
            vm_pu=system.ext_grid.vm_pu,
            va_degree=system.ext_grid.va_degree,
            in_service=system.ext_grid.in_service
        )
        
        # Adicionar linhas
        for line in system.lines:
            pp.create_line_from_parameters(
                net,
                from_bus=bus_indices[line.from_bus],
                to_bus=bus_indices[line.to_bus],
                length_km=1,
                r_ohm_per_km=line.r * system.baseMVA,
                x_ohm_per_km=line.x * system.baseMVA,
                c_nf_per_km=line.b * 1e9 / system.baseMVA,
                max_i_ka=line.rateA / (system.buses[0].base_kv * np.sqrt(3)),
                in_service=bool(line.status)
            )
        
        # Executar fluxo de potência
        pp.runpp(net)
        
        # Preparar resultados
        return PowerSystemResult(
            buses=[
                BusResult(
                    bus_id=list(bus_indices.keys())[list(bus_indices.values()).index(i)],
                    vm_pu=float(net.res_bus.vm_pu[i]),
                    va_degree=float(net.res_bus.va_degree[i]),
                    p_mw=float(net.res_bus.p_mw[i]),
                    q_mvar=float(net.res_bus.q_mvar[i])
                )
                for i in range(len(net.bus))
            ],
            lines=[
                LineResult(
                    from_bus=list(bus_indices.keys())[list(bus_indices.values()).index(int(net.line.from_bus[i]))],
                    to_bus=list(bus_indices.keys())[list(bus_indices.values()).index(int(net.line.to_bus[i]))],
                    p_from_mw=float(net.res_line.p_from_mw[i]),
                    q_from_mvar=float(net.res_line.q_from_mvar[i]),
                    p_to_mw=float(net.res_line.p_to_mw[i]),
                    q_to_mvar=float(net.res_line.q_to_mvar[i]),
                    pl_mw=float(net.res_line.pl_mw[i]),
                    ql_mvar=float(net.res_line.ql_mvar[i]),
                    i_ka=float(net.res_line.i_ka[i]),
                    loading_percent=float(net.res_line.loading_percent[i]),
                    in_service=bool(net.line.in_service[i])
                )
                for i in range(len(net.line))
            ],
            loads=[
                LoadResult(
                    bus_id=list(bus_indices.keys())[list(bus_indices.values()).index(int(net.load.bus[i]))],
                    p_mw=float(net.res_load.p_mw[i]),
                    q_mvar=float(net.res_load.q_mvar[i]),
                    scaling=float(net.load.scaling[i])
                )
                for i in range(len(net.load))
            ],
            generators=[
                GeneratorResult(
                    bus_id=list(bus_indices.keys())[list(bus_indices.values()).index(int(net.gen.bus[i]))],
                    p_mw=float(net.res_gen.p_mw[i]),
                    q_mvar=float(net.res_gen.q_mvar[i]),
                    vm_pu=float(net.gen.vm_pu[i]),
                    in_service=bool(net.gen.in_service[i])
                )
                for i in range(len(net.gen))
            ],
            ext_grid=ExtGridResult(
                bus_id=list(bus_indices.keys())[list(bus_indices.values()).index(int(net.ext_grid.bus[0]))],
                p_mw=float(net.res_ext_grid.p_mw[0]),
                q_mvar=float(net.res_ext_grid.q_mvar[0])
            )
        )
        
    except LoadflowNotConverged:
        raise ValueError("O fluxo de potência não convergiu")
    except Exception as e:
        raise ValueError(f"Erro na simulação: {str(e)}")