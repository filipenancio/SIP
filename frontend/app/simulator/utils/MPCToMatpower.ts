import { MPC } from './SimulateUtils';

/**
 * Converte um objeto MPC para formato MATPOWER (texto)
 */
export function mpcToMatpower(mpc: MPC, caseName: string = 'case3p'): string {
  let output = `function mpc = ${caseName}\n`;
  output += `%${caseName.toUpperCase()}\n\n`;
  
  output += `%% MATPOWER Case Format : Version ${mpc.version}\n`;
  output += `mpc.version = '${mpc.version}';\n\n`;
  
  output += `%%-----  Power Flow Data  -----%%\n`;
  output += `%% system MVA base\n`;
  output += `mpc.baseMVA = ${mpc.baseMVA};\n\n`;
  
  // Bus data
  output += `%% bus data\n`;
  output += `%\tbus_i\ttype\tPd\tQd\tGs\tBs\tarea\tVm\tVa\tbaseKV\tzone\tVmax\tVmin\n`;
  output += `mpc.bus = [\n`;
  
  mpc.bus.forEach((bus, index) => {
    const isLast = index === mpc.bus.length - 1;
    output += `\t${bus.bus_i}\t${bus.type}\t${bus.Pd}\t${bus.Qd}\t${bus.Gs}\t${bus.Bs}\t${bus.area}\t${bus.Vm}\t${bus.Va}\t${bus.baseKV}\t${bus.zone}\t${bus.Vmax}\t${bus.Vmin}${isLast ? '' : ';'}\n`;
  });
  
  output += `];\n\n`;
  
  // Generator data
  output += `%% generator data\n`;
  output += `%\tbus\tPg\tQg\tQmax\tQmin\tVg\tmBase\tstatus\tPmax\tPmin\n`;
  output += `mpc.gen = [\n`;
  
  mpc.gen.forEach((gen, index) => {
    const isLast = index === mpc.gen.length - 1;
    output += `\t${gen.bus}\t${gen.Pg}\t${gen.Qg}\t${gen.Qmax}\t${gen.Qmin}\t${gen.Vg}\t${gen.mBase}\t${gen.status}\t${gen.Pmax}\t${gen.Pmin}${isLast ? '' : ';'}\n`;
  });
  
  output += `];\n\n`;
  
  // Branch data
  output += `%% branch data\n`;
  output += `%\tfbus\ttbus\tr\tx\tb\trateA\trateB\trateC\tratio\tangle\tstatus\tangmin\tangmax\n`;
  output += `mpc.branch = [\n`;
  
  mpc.branch.forEach((branch, index) => {
    const isLast = index === mpc.branch.length - 1;
    output += `\t${branch.fbus}\t${branch.tbus}\t${branch.r}\t${branch.x}\t${branch.b}\t${branch.rateA}\t${branch.rateB}\t${branch.rateC}\t${branch.ratio}\t${branch.angle}\t${branch.status}\t${branch.angmin}\t${branch.angmax}${isLast ? '' : ';'}\n`;
  });
  
  output += `];\n`;
  
  return output;
}
