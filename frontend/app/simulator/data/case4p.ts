import { MPC } from '../utils/SimulateUtils';

// Sistema de 4 barras (case4p.m)
export const sistema4Barras: MPC = {
  version: '2',
  baseMVA: 100,
  bus: [
    { bus_i: 1, type: 1, Pd: 40, Qd: 30, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9 },
    { bus_i: 2, type: 2, Pd: 20, Qd: 105, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9 },
    { bus_i: 3, type: 1, Pd: 30, Qd: 125, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9 },
    { bus_i: 4, type: 3, Pd: 0, Qd: 50, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9 }
  ],
  gen: [
    { bus: 1, Pg: 0, Qg: 0, Qmax: 30, Qmin: -30, Vg: 1, mBase: 100, status: 1, Pmax: 500, Pmin: 0 },
    { bus: 2, Pg: 40, Qg: 0, Qmax: 105, Qmin: -105, Vg: 1, mBase: 100, status: 1, Pmax: 300, Pmin: 0 },
    { bus: 3, Pg: 0, Qg: 0, Qmax: 390, Qmin: -390, Vg: 1, mBase: 100, status: 1, Pmax: 300, Pmin: 0 },
    { bus: 4, Pg: 0, Qg: 0, Qmax: 150, Qmin: -150, Vg: 1, mBase: 100, status: 1, Pmax: 318, Pmin: 0 }
  ],
  branch: [
    { fbus: 1, tbus: 2, r: 0.01008, x: 0.1, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 1, tbus: 3, r: 0.00744, x: 0.2, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 4, r: 0.00744, x: 0.4, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 3, tbus: 4, r: 0.01272, x: 0.2, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 }
  ]
};
