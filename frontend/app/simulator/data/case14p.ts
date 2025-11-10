import { MPC } from '../utils/SimulateUtils';

// Sistema de 14 barras (case14p.m)
export const sistema14Barras: MPC = {
  version: '2',
  baseMVA: 100,
  bus: [
    { bus_i: 1, type: 3, Pd: 0, Qd: 0, Gs: 0, Bs: 0, area: 1, Vm: 1.06, Va: 0, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 2, type: 2, Pd: 21.7, Qd: 12.7, Gs: 0, Bs: 0, area: 1, Vm: 1.045, Va: -4.98, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 3, type: 2, Pd: 64.2, Qd: 19, Gs: 0, Bs: 0, area: 1, Vm: 1.01, Va: -12.72, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 4, type: 1, Pd: 47.8, Qd: -3.9, Gs: 0, Bs: 0, area: 1, Vm: 1.019, Va: -10.33, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 5, type: 1, Pd: 90, Qd: 1.6, Gs: 0, Bs: 0, area: 1, Vm: 1.02, Va: -8.78, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 6, type: 2, Pd: 11.2, Qd: 7.5, Gs: 0, Bs: 0, area: 1, Vm: 1.07, Va: -14.22, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 7, type: 1, Pd: 0, Qd: 0, Gs: 0, Bs: 0, area: 1, Vm: 1.062, Va: -13.37, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 8, type: 2, Pd: 0, Qd: 0, Gs: 0, Bs: 0, area: 1, Vm: 1.09, Va: -13.36, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 9, type: 1, Pd: 29.5, Qd: 16.6, Gs: 0, Bs: 19, area: 1, Vm: 1.056, Va: -14.94, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 10, type: 1, Pd: 4.9, Qd: 5.8, Gs: 0, Bs: 0, area: 1, Vm: 1.051, Va: -15.1, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 11, type: 1, Pd: 8.5, Qd: 1.8, Gs: 0, Bs: 0, area: 1, Vm: 1.057, Va: -14.79, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 12, type: 1, Pd: 6.1, Qd: 1.6, Gs: 0, Bs: 0, area: 1, Vm: 1.055, Va: -15.07, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 13, type: 1, Pd: 33.5, Qd: 5.8, Gs: 0, Bs: 0, area: 1, Vm: 1.05, Va: -15.16, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 },
    { bus_i: 14, type: 1, Pd: 14.9, Qd: 5, Gs: 0, Bs: 0, area: 1, Vm: 1.036, Va: -16.04, baseKV: 0, zone: 1, Vmax: 1.06, Vmin: 0.94 }
  ],
  gen: [
    { bus: 1, Pg: 0, Qg: -16.9, Qmax: 10, Qmin: 0, Vg: 1.05, mBase: 100, status: 1, Pmax: 332.4, Pmin: 0 },
    { bus: 2, Pg: 25, Qg: 42.4, Qmax: 50, Qmin: -40, Vg: 1.045, mBase: 100, status: 1, Pmax: 140, Pmin: 0 },
    { bus: 3, Pg: 70.5, Qg: 23.4, Qmax: 40, Qmin: 0, Vg: 1.01, mBase: 100, status: 1, Pmax: 100, Pmin: 0 },
    { bus: 6, Pg: 15.5, Qg: 12.2, Qmax: 24, Qmin: -6, Vg: 1.07, mBase: 100, status: 1, Pmax: 100, Pmin: 0 },
    { bus: 8, Pg: 5.2, Qg: 17.4, Qmax: 24, Qmin: -6, Vg: 1.09, mBase: 100, status: 1, Pmax: 100, Pmin: 0 }
  ],
  branch: [
    { fbus: 1, tbus: 2, r: 0.01938, x: 0.05917, b: 0.0528, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 1, tbus: 5, r: 0.05403, x: 0.22304, b: 0.0492, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 3, r: 0.04699, x: 0.19797, b: 0.0438, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 4, r: 0.05811, x: 0.17632, b: 0.034, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 5, r: 0.05695, x: 0.17388, b: 0.0346, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 3, tbus: 4, r: 0.06701, x: 0.17103, b: 0.0128, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 4, tbus: 5, r: 0.01335, x: 0.04211, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 4, tbus: 7, r: 0, x: 0.20912, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0.978, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 4, tbus: 9, r: 0, x: 0.55618, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0.969, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 5, tbus: 6, r: 0, x: 0.25202, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0.932, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 6, tbus: 11, r: 0.09498, x: 0.1989, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 6, tbus: 12, r: 0.12291, x: 0.25581, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 6, tbus: 13, r: 0.06615, x: 0.13027, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 7, tbus: 8, r: 0, x: 0.17615, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 7, tbus: 9, r: 0, x: 0.11001, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 9, tbus: 10, r: 0.03181, x: 0.0845, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 9, tbus: 14, r: 0.12711, x: 0.27038, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 10, tbus: 11, r: 0.08205, x: 0.19207, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 12, tbus: 13, r: 0.22092, x: 0.19988, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 13, tbus: 14, r: 0.17093, x: 0.34802, b: 0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 }
  ]
};
