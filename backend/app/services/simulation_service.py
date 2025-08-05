# services/simulation_service.py
import pandapower as pp
import pandapower.networks as pn
from app.models.power_system import PowerSystem
from app.utils.parser import convert_to_pp

def run_power_flow(system: PowerSystem):
    # net = pp.create_empty_network()
    net = convert_to_pp(system)

    # montar o sistema com base nos dados de entrada (data)
    # exemplo: pp.create_bus, pp.create_line, etc.

    pp.runpp(net)
    return {
        "bus_voltages": net.res_bus.to_dict(orient="records"),
        "line_loading": net.res_line.to_dict(orient="records")
    }

