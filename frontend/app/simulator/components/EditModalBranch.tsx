import React from 'react';
import { EditModalBase } from './EditModalBase';

export interface Branch {
  fbus: number;
  tbus: number;
  r: number;
  x: number;
  b: number;
  rateA: number;
  rateB: number;
  rateC: number;
  ratio: number;
  angle: number;
  status: number;
  angmin: number;
  angmax: number;
  baseMVA: number;
}

interface EditModalBranchProps {
  show: boolean;
  data: Branch | null;
  onClose: () => void;
  onSave: () => void;
  onRestore: () => void;
  onChange: (newData: Branch) => void;
}

const NumericInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: React.CSSProperties;
}> = ({ value, onChange, min, max, step = 0.01, style }) => {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step}
      style={{
        padding: '6px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '12px',
        ...style
      }}
    />
  );
};

export const EditModalBranch: React.FC<EditModalBranchProps> = ({
  show,
  data,
  onClose,
  onSave,
  onRestore,
  onChange
}) => {
  if (!data) return null;

  const renderField = (label: string, key: keyof Branch, unit: string, min?: number, max?: number, step?: number) => (
    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
      <label style={{ 
        minWidth: '130px', 
        marginRight: '10px', 
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#000'
      }}>
        {label}:
      </label>
      <NumericInput
        value={data[key] as number}
        onChange={(value: number) => onChange({ ...data, [key]: value })}
        min={min}
        max={max}
        step={step || 0.01}
        style={{ width: '200px' }}
      />
      <span style={{ 
        marginLeft: '8px', 
        fontSize: '12px', 
        color: '#666',
        minWidth: '50px'
      }}>
        {unit}
      </span>
    </div>
  );

  return (
    <EditModalBase
      show={show}
      title={`Edição de Linha (L${data.fbus}-${data.tbus})`}
      onClose={onClose}
      onSave={onSave}
      onRestore={onRestore}
    >
      <div>
        {/* Campo baseMVA - somente leitura */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '130px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Base MVA:
          </label>
          <span style={{
            width: '200px',
            padding: '6px 8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            {data.baseMVA || 100}
          </span>
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#666',
            minWidth: '50px'
          }}>
            MVA
          </span>
        </div>

        {renderField('Resistência', 'r', 'pu')}
        {renderField('Reatância', 'x', 'pu')}
        {renderField('Susceptância', 'b', 'pu')}
        {renderField('Capacidade A', 'rateA', 'MVA')}
        {renderField('Capacidade B', 'rateB', 'MVA')}
        {renderField('Capacidade C', 'rateC', 'MVA')}
        {renderField('Tap', 'angle', '°', -360, 360, 0.1)}
      </div>
    </EditModalBase>
  );
};
