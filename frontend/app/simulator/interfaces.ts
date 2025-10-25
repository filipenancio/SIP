export interface BusVoltage {
  magnitude: number;
  angle: number;
}

export interface SimulationResults {
  nBus: number;
  baseMVA: number;
  voltages: BusVoltage[];
}