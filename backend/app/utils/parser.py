import pandapower as pp
from app.models.power_system import PowerSystem

def convert_to_pp(system: PowerSystem):
    net = pp.create_empty_network()
    
    # Adiciona barras
    for bus in system.buses:
        pp.create_bus(net, vn_kv=13.8, name=f"Bus {bus.id}")
    
    # Adiciona cargas e geração (simplificado)
    for bus in system.buses:
        if bus.p_mw != 0 or bus.q_mvar != 0:
            pp.create_load(net, bus=bus.id, p_mw=bus.p_mw, q_mvar=bus.q_mvar)

    # Adiciona linhas
    for line in system.lines:
        pp.create_line_from_parameters(
            net,
            from_bus=line.from_bus,
            to_bus=line.to_bus,
            length_km=line.length_km,
            r_ohm_per_km=line.r_ohm_per_km,
            x_ohm_per_km=line.x_ohm_per_km,
            c_nf_per_km=line.c_nf_per_km,
            max_i_ka=1.0,
            name=f"Line {line.from_bus}-{line.to_bus}"
        )

    return net
