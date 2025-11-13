import React from 'react';
import { EditModalBase } from './EditModalBase';
import { NumericInput } from './NumericInput';

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

interface GeneratorResultData {
  bus_id: number;
  p_mw: number;
  q_mvar: number;
  vm_pu: number;
}

interface ExtGridResultData {
  bus_id: number;
  p_mw: number;
  q_mvar: number;
}

interface EditModalGeneratorProps {
  show: boolean;
  data: Generator | null;
  generatorResult?: GeneratorResultData;
  extGridResult?: ExtGridResultData;
  onClose: () => void;
  onSave?: () => void;
  onRestore?: () => void;
  onChange?: (newData: Generator) => void;
  viewOnly?: boolean;
}

export const EditModalGenerator: React.FC<EditModalGeneratorProps> = ({
  show,
  data,
  generatorResult,
  extGridResult,
  onClose,
  onSave,
  onRestore,
  onChange,
  viewOnly = false
}) => {
  if (!data) return null;

  const isResultView = viewOnly;

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
        onChange={viewOnly ? () => {} : (value: number) => onChange?.({ ...data, [key]: value })}
        min={min}
        max={max}
        step={step || 0.01}
        disabled={viewOnly}
        style={{ width: '200px', backgroundColor: viewOnly ? '#f5f5f5' : 'white', cursor: viewOnly ? 'default' : 'text' }}
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
      viewOnly={viewOnly}
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

        {isResultView ? (
          // Visualização de Resultado
          <>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <label style={{ 
                minWidth: '130px', 
                marginRight: '10px', 
                fontWeight: 'bold',
                fontSize: '12px',
                color: '#000'
              }}>
                P:
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
                {generatorResult ? generatorResult.p_mw.toFixed(2) : extGridResult ? extGridResult.p_mw.toFixed(2) : '0.00'}
              </span>
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                color: '#666',
                minWidth: '50px'
              }}>
                MW
              </span>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <label style={{ 
                minWidth: '130px', 
                marginRight: '10px', 
                fontWeight: 'bold',
                fontSize: '12px',
                color: '#000'
              }}>
                Q:
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
                {generatorResult ? generatorResult.q_mvar.toFixed(2) : extGridResult ? extGridResult.q_mvar.toFixed(2) : '0.00'}
              </span>
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                color: '#666',
                minWidth: '50px'
              }}>
                MVAr
              </span>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <label style={{ 
                minWidth: '130px', 
                marginRight: '10px', 
                fontWeight: 'bold',
                fontSize: '12px',
                color: '#000'
              }}>
                V:
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
                {generatorResult ? generatorResult.vm_pu.toFixed(3) : '1.000'}
              </span>
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                color: '#666',
                minWidth: '50px'
              }}>
                pu
              </span>
            </div>
          </>
        ) : (
          // Visualização de Edição
          <>
        {renderField('Tensão', 'Vg', 'pu', 0.8, 1.2, 0.01)}
        {renderField('Potência Ativa', 'Pg', 'MW', 0)}
        {renderField('Potência Reativa', 'Qg', 'MVAr')}
        {renderField('Potência Máxima', 'Pmax', 'MW', 0)}
        {renderField('Potência Mínima', 'Pmin', 'MW', 0)}
        {renderField('Reativa Máxima', 'Qmax', 'MVAr')}
        {renderField('Reativa Mínima', 'Qmin', 'MVAr')}
          </>
        )}
      </div>
    </EditModalBase>
  );
};
