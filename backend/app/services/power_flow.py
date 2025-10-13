import pandapower as pp
import numpy as np
from app.models.power_system import PowerSystem
from pandapower.powerflow import LoadflowNotConverged  # Fixed import

def simulate_power_flow(system: PowerSystem):
    try:
        net = pp.create_empty_network(sn_mva=system.baseMVA)
        
        # Map bus indices
        bus_indices = {}
        
        # Add buses
        for bus in system.buses:
            idx = pp.create_bus(
                net,
                vn_kv=bus.base_kv,
                min_vm_pu=bus.vm_min,
                max_vm_pu=bus.vm_max
            )
            bus_indices[bus.id] = idx
            
            # Add loads
            if bus.Pd != 0 or bus.Qd != 0:
                pp.create_load(
                    net,
                    bus=idx,
                    p_mw=bus.Pd,
                    q_mvar=bus.Qd
                )
            
            # Configure slack bus
            if bus.type == 3:
                pp.create_ext_grid(
                    net,
                    bus=idx,
                    vm_pu=bus.Vm,
                    va_degree=bus.Va
                )
            
            # Configure PV bus
            elif bus.type == 2:
                pp.create_gen(
                    net,
                    bus=idx,
                    vm_pu=bus.Vm,
                    p_mw=0.0
                )
        
        # Add lines
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
        
        try:
            pp.runpp(net)
        except LoadflowNotConverged as e:
            raise ValueError("O fluxo de potência não convergiu") from e
        
        # Prepare results
        result = {
            "buses": [
                {
                    "id": bus.id,
                    "type": bus.type,
                    "Pd": bus.Pd,
                    "Qd": bus.Qd,
                    "Vm": float(net.res_bus.vm_pu[bus_indices[bus.id]]),
                    "Va": float(net.res_bus.va_degree[bus_indices[bus.id]]),
                    "area": bus.area,
                    "vm_min": bus.vm_min,
                    "vm_max": bus.vm_max,
                    "base_kv": bus.base_kv
                }
                for bus in system.buses
            ],
            "lines": [
                {
                    "from_bus": line.from_bus,
                    "to_bus": line.to_bus,
                    "r": line.r,
                    "x": line.x,
                    "b": line.b,
                    "rateA": line.rateA,
                    "rateB": line.rateB,
                    "rateC": line.rateC,
                    "ratio": line.ratio,
                    "angle": line.angle,
                    "status": line.status,
                    "loading_percent": float(net.res_line.loading_percent[idx])
                }
                for idx, line in enumerate(system.lines)
            ]
        }
        
        return result
        
    except Exception as e:
        print(f"Error in power flow simulation: {str(e)}")
        raise