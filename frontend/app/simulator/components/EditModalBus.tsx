import React from 'react';
import { EditModalBase } from './EditModalBase';

export interface Bus {
  bus_i: number;
  type: number;
  Pd: number;
  Qd: number;
  Gs: number;
  Bs: number;
  area: number;
  Vm: number;
  Va: number;
  baseKV: number;
  zone: number;
  Vmax: number;
  Vmin: number;
  hasGenerator?: boolean;
}

interface EditModalBusProps {
  show: boolean;
  data: Bus | null;
  onClose: () => void;
  onSave: () => void;
  onRestore: () => void;
  onChange: (newData: Bus) => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '50px',
        height: '25px',
        borderRadius: '25px',
        backgroundColor: checked ? '#007AFF' : '#E5E5E5',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <div
        style={{
          width: '21px',
          height: '21px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px',
          left: checked ? '27px' : '2px',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );
};

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

export const EditModalBus: React.FC<EditModalBusProps> = ({
  show,
  data,
  onClose,
  onSave,
  onRestore,
  onChange
}) => {
  if (!data) return null;

  const busTypeNames: { [key: number]: string } = {
    1: 'PQ (Carga)',
    2: 'PV (Gerador)',
    3: 'Slack (Referência)'
  };

  const renderField = (label: string, key: keyof Bus, unit: string, min?: number, max?: number, step?: number) => (
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
      title={`Edição de Barra (Barra ${data.bus_i})`}
      onClose={onClose}
      onSave={onSave}
      onRestore={onRestore}
    >
      <div>
        {/* Campo do tipo de barra - somente leitura */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '130px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Tipo:
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
            {busTypeNames[data.type] || 'Desconhecido'}
          </span>
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#666',
            minWidth: '50px'
          }}>
            {/* Espaço para unidade */}
          </span>
        </div>

        {/* Campo baseKV - somente leitura */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '130px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Base kV:
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
            {data.baseKV || 230}
          </span>
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#666',
            minWidth: '50px'
          }}>
            kV
          </span>
        </div>

        {/* Campos de demanda */}
        {renderField('Potência Ativa', 'Pd', 'MW', 0)}
        {renderField('Potência Reativa', 'Qd', 'MVAr', 0)}
        
        {/* Campos de tensão */}
        {renderField('Tensão', 'Vm', 'pu', 0.8, 1.2, 0.01)}
        {renderField('Ângulo', 'Va', '°', -180, 180, 0.1)}
        {renderField('V máxima', 'Vmax', 'pu', 0.8, 1.2, 0.01)}
        {renderField('V mínima', 'Vmin', 'pu', 0.8, 1.2, 0.01)}
        
        {/* Campo do gerador - movido para o final */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '130px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Gerador:
          </label>
          <div style={{ width: '200px', display: 'flex', alignItems: 'center' }}>
            <ToggleSwitch
              checked={data.hasGenerator || false}
              onChange={(checked: boolean) => onChange({ ...data, hasGenerator: checked })}
              disabled={data.type === 3} // Barra slack sempre tem gerador
            />
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '12px', 
              color: data.type === 3 ? '#999' : '#666'
            }}>
              {data.hasGenerator ? 'Sim' : 'Não'}
            </span>
          </div>
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#999',
            minWidth: '50px',
            fontStyle: 'italic'
          }}>
            {data.type === 3 ? '(obrig.)' : ''}
          </span>
        </div>
      </div>
    </EditModalBase>
  );
};
