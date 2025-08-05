# utils/network_templates.py
import pandapower as pp

def create_empty_network():
    net = pp.create_empty_network()
    return net

def create_ieee14_network():
    net = pp.networks.case14()
    return net
