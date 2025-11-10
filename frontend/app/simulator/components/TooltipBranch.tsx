import React from 'react';
import { Branch } from './EditModalBranch';
import { LineResult } from './Diagram3Bus';

interface TooltipBranchProps {
  branch: Branch;
  lineResult?: LineResult;
  isResultView?: boolean;
}

export const TooltipBranch: React.FC<TooltipBranchProps> = ({ 
  branch, 
  lineResult, 
  isResultView = false 
}) => {
  const isResult = isResultView && lineResult;
  
  return (
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
        Linha {branch.fbus} → {branch.tbus}
      </div>
      {isResult ? (
        <>
          <div>P (de): {lineResult.p_from_mw.toFixed(2)} MW</div>
          <div>Q (de): {lineResult.q_from_mvar.toFixed(2)} MVAr</div>
          <div>P (para): {lineResult.p_to_mw.toFixed(2)} MW</div>
          <div>Q (para): {lineResult.q_to_mvar.toFixed(2)} MVAr</div>
          <div>Perda P: {lineResult.p_loss_mw.toFixed(2)} MW</div>
          <div>Perda Q: {lineResult.q_loss_mvar.toFixed(2)} MVAr</div>
          <div>% de uso: {lineResult.loading_percent.toFixed(2)}%</div>
        </>
      ) : (
        <>
          <div>Base MVA: {branch.baseMVA || 100} MVA</div>
          <div>R: {branch.r.toFixed(4)} pu</div>
          <div>X: {branch.x.toFixed(4)} pu</div>
          <div>B: {branch.b.toFixed(4)} pu</div>
          <div>Rate A: {branch.rateA.toFixed(0)} MVA</div>
          <div>Rate B: {branch.rateB.toFixed(0)} MVA</div>
          <div>Rate C: {branch.rateC.toFixed(0)} MVA</div>
          <div>Tap: {branch.angle.toFixed(2)}°</div>
        </>
      )}
    </div>
  );
};
