import React from 'react';
import { Bus } from './EditModalBus';

interface BusResultData {
  bus_id: number;
  vm_pu: number;
  va_degree: number;
  p_mw: number;
  q_mvar: number;
}

interface TooltipBusProps {
  bus: Bus;
  busResult?: BusResultData;
  isResultView?: boolean;
}

export const TooltipBus: React.FC<TooltipBusProps> = ({ bus, busResult, isResultView = false }) => {
  const isResult = isResultView && busResult;
  
  return (
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Barra {bus.bus_i}</div>
      <div>Tipo: {bus.type === 3 ? 'Slack' : bus.type === 2 ? 'PV' : 'PQ'}</div>
      <div>Base kV: {bus.baseKV} kV</div>
      {isResult ? (
        <>
          <div>V: {busResult.vm_pu.toFixed(3)} pu</div>
          <div>θ: {busResult.va_degree.toFixed(2)}°</div>
          <div>P: {busResult.p_mw.toFixed(2)} MW</div>
          <div>Q: {busResult.q_mvar.toFixed(2)} MVAr</div>
        </>
      ) : (
        <>
          <div>Pd: {bus.Pd.toFixed(1)} MW</div>
          <div>Qd: {bus.Qd.toFixed(1)} MVAr</div>
          <div>V: {bus.Vm.toFixed(3)} pu</div>
          <div>θ: {bus.Va.toFixed(2)}°</div>
          <div>Vmax: {bus.Vmax.toFixed(2)} pu</div>
          <div>Vmin: {bus.Vmin.toFixed(2)} pu</div>
          <div>Bs: {bus.Bs.toFixed(3)} pu</div>
        </>
      )}
    </div>
  );
};
