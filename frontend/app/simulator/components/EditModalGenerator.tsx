import React from 'react';
import { EditModalBase } from './EditModalBase';

export interface Generator {
  bus: number;
  Pg: number;
  Qg: number;
  Qmax: number;
  Qmin: number;
  Vg: number;
  mBase: number;
  status: number;
  Pmax: number;
  Pmin: number;
  Pc1?: number;
  Pc2?: number;
  Qc1min?: number;
  Qc1max?: number;
  Qc2min?: number;
  Qc2max?: number;
  ramp_agc?: number;
  ramp_10?: number;
  ramp_30?: number;
  ramp_q?: number;
  apf?: number;
}

interface EditModalGeneratorProps {
  show: boolean;
  data: Generator | null;
  onClose: () => void;
  onSave: () => void;
  onRestore: () => void;
  onChange: (newData: Generator) => void;
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

export const EditModalGenerator: React.FC<EditModalGeneratorProps> = ({
  show,
  data,
  onClose,
  onSave,
  onRestore,
  onChange
}) => {
  if (!data) return null;

  const renderField = (label: string, key: keyof Generator, unit: string, min?: number, max?: number, step?: number) => (
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
      title={`Edição de Gerador (Barra ${data.bus})`}
      onClose={onClose}
      onSave={onSave}
      onRestore={onRestore}
    >
      <div>
        {/* Campo mBase - somente leitura */}
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
            {data.mBase || 100}
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

        {renderField('Potência Ativa', 'Pg', 'MW', 0)}
        {renderField('Potência Reativa', 'Qg', 'MVAr')}
        {renderField('Tensão', 'Vg', 'pu', 0.8, 1.2, 0.01)}
        {renderField('Potência Máxima', 'Pmax', 'MW', 0)}
        {renderField('Potência Mínima', 'Pmin', 'MW', 0)}
        {renderField('Reativa Máxima', 'Qmax', 'MVAr')}
        {renderField('Reativa Mínima', 'Qmin', 'MVAr')}
      </div>
    </EditModalBase>
  );
};
