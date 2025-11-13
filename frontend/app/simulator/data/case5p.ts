import { MPC } from '../utils/SimulateUtils';

// Sistema de 5 barras (case5p.m)
export const sistema5Barras: MPC = {
  version: '2',
  baseMVA: 100,
  bus: [
    { bus_i: 1, type: 2, Pd: 0, Qd: 0, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.05, Vmin: 0.95, hasGenerator: true },
    { bus_i: 2, type: 1, Pd: 200, Qd: 180, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.05, Vmin: 0.95, hasGenerator: false },
    { bus_i: 3, type: 1, Pd: 60, Qd: 150, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.05, Vmin: 0.95, hasGenerator: false },
    { bus_i: 4, type: 3, Pd: 0, Qd: 0, Gs: 0, Bs: 0, area: 1, Vm: 1.02, Va: 0, baseKV: 230, zone: 1, Vmax: 1.05, Vmin: 0.95, hasGenerator: true },
    { bus_i: 5, type: 1, Pd: 40, Qd: 130, Gs: 0, Bs: 0, area: 1, Vm: 1, Va: 0, baseKV: 230, zone: 1, Vmax: 1.05, Vmin: 0.95, hasGenerator: false }
  ],
  gen: [
    { bus: 1, Pg: 150, Qg: 0, Qmax: 400, Qmin: -400, Vg: 1, mBase: 100, status: 1, Pmax: 0, Pmin: 0 },
    { bus: 4, Pg: 0, Qg: 0, Qmax: 400, Qmin: -400, Vg: 1.02, mBase: 100, status: 1, Pmax: 800, Pmin: 0 }
  ],
  branch: [
    { fbus: 1, tbus: 2, r: 0.008, x: 0.04, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 1, tbus: 4, r: 0.006, x: 0.03, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 1, tbus: 5, r: 0.005, x: 0.08, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 3, r: 0.008, x: 0.04, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 3, tbus: 4, r: 0.004, x: 0.02, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 4, tbus: 5, r: 0.006, x: 0.03, b: 0.001, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 }
  ]
};
