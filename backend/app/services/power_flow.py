import pandapower as pp
import numpy as np
from app.models.power_system_input import PowerSystemInput
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
        loads = []  # Lista para armazenar as cargas das barras
        ext_grid = None  # Referência para a barra slack
        
        # Adicionar barras
        for bus in system.buses:
            idx = pp.create_bus(
                net,
                vn_kv=bus.base_kv,
                min_vm_pu=bus.vm_min,
                max_vm_pu=bus.vm_max,
                zone=bus.zone,
                type=bus.type
            )
            bus_indices[bus.id] = idx
            
            # Adicionar cargas das barras
            if bus.Pd != 0 or bus.Qd != 0:
                pp.create_load(
                    net,
                    bus=idx,
                    p_mw=bus.Pd,
                    q_mvar=bus.Qd,
                    in_service=True
                )
        
        # As cargas já foram adicionadas junto com as barras
        # Adicionar geradores
        slack_bus = next((bus.id for bus in system.buses if bus.type == 3), None)
        
        for gen in system.generators:
            if gen.bus == slack_bus:
                # Se for o gerador da barra slack, criar como ext_grid
                pp.create_ext_grid(
                    net,
                    bus=bus_indices[gen.bus],
                    vm_pu=gen.Vg,
                    va_degree=0.0,  # Ângulo de referência
                    in_service=bool(gen.status)
                )
            else:
                # Outros geradores como PV
                pp.create_gen(
                    net,
                    bus=bus_indices[gen.bus],
                    p_mw=gen.pg,
                    vm_pu=gen.Vg,
                    max_q_mvar=gen.qmax,
                    min_q_mvar=gen.qmin,
                    in_service=bool(gen.status)
                )
        
        # A barra slack já foi adicionada no processamento dos geradores
        
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
        result = PowerSystemResult(
            buses=[
                BusResult(
                    bus_id=i+1,
                    vm_pu=float(net.res_bus.vm_pu[i]),  # Ajustado nome
                    va_degree=float(net.res_bus.va_degree[i]),  # Ajustado nome
                    p_mw=float(net.res_bus.p_mw[i]),
                    q_mvar=float(net.res_bus.q_mvar[i])
                )
                for i in range(len(net.bus))
            ],
            lines=[
                LineResult(
                    from_bus=int(net.line.from_bus[i]) + 1,
                    to_bus=int(net.line.to_bus[i]) + 1,
                    p_from_mw=float(net.res_line.p_from_mw[i]),
                    q_from_mvar=float(net.res_line.q_from_mvar[i]),
                    p_to_mw=float(net.res_line.p_to_mw[i]),
                    q_to_mvar=float(net.res_line.q_to_mvar[i]),
                    pl_mw=float(net.res_line.pl_mw[i]),
                    ql_mvar=float(net.res_line.ql_mvar[i]),
                    i_ka=float(net.res_line.i_ka[i]),
                    loading_percent=float(net.res_line.loading_percent[i]),
                    status=int(net.line.in_service[i])
                )
                for i in range(len(net.line))
            ],
            loads=[
                LoadResult(
                    bus_id=int(net.load.bus[i]) + 1,
                    p_mw=float(net.res_load.p_mw[i]),
                    q_mvar=float(net.res_load.q_mvar[i]),
                    scaling=float(net.load.scaling[i])
                )
                for i in range(len(net.load))
            ] if len(net.load) > 0 else [],
            generators=[
                GeneratorResult(
                    bus_id=int(net.gen.bus[i]) + 1,
                    p_mw=float(net.res_gen.p_mw[i]),
                    q_mvar=float(net.res_gen.q_mvar[i]),
                    vm_pu=float(net.gen.vm_pu[i]),  # Ajustado nome
                    in_service=bool(net.gen.in_service[i])
                )
                for i in range(len(net.gen))
            ] if len(net.gen) > 0 else [],
            ext_grid=ExtGridResult(
                bus_id=int(net.ext_grid.bus[0]) + 1,
                p_mw=float(net.res_ext_grid.p_mw[0]),
                q_mvar=float(net.res_ext_grid.q_mvar[0])
            )
        )
        
    except LoadflowNotConverged:
        raise ValueError("O fluxo de potência não convergiu")
    except Exception as e:
        raise ValueError(f"Erro na simulação: {str(e)}")