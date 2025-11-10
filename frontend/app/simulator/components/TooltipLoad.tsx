import React from 'react';
import { Bus } from './EditModalBus';

interface LoadResultData {
  bus_id: number;
  p_mw: number;
  q_mvar: number;
}

interface TooltipLoadProps {
  bus: Bus;
  loadResult?: LoadResultData;
  isResultView?: boolean;
}

export const TooltipLoad: React.FC<TooltipLoadProps> = ({ 
  bus, 
  loadResult, 
  isResultView = false 
}) => {
  const isResult = isResultView && loadResult;
  
  return (
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
        Carga - Barra {bus.bus_i}
      </div>
      {isResult ? (
        <>
          <div>P: {loadResult.p_mw.toFixed(2)} MW</div>
          <div>Q: {loadResult.q_mvar.toFixed(2)} MVAr</div>
        </>
      ) : (
        <>
          <div>Pd: {bus.Pd.toFixed(1)} MW</div>
          <div>Qd: {bus.Qd.toFixed(1)} MVAr</div>
        </>
      )}
    </div>
  );
};
