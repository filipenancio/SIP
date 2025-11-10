import React from 'react';
import { createPortal } from 'react-dom';

interface EditModalBaseValuesProps {
  show: boolean;
  baseMVA: number;
  baseKV: number;
  onClose: () => void;
  onSave: () => void;
  onRestore: () => void;
  onChangeBaseMVA: (value: number) => void;
  onChangeBaseKV: (value: number) => void;
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

export const EditModalBaseValues: React.FC<EditModalBaseValuesProps> = ({
  show,
  baseMVA,
  baseKV,
  onClose,
  onSave,
  onRestore,
  onChangeBaseMVA,
  onChangeBaseKV
}) => {
  if (!show) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        minWidth: '400px',
        maxWidth: '500px',
        position: 'relative'
      }}>
        {/* Botão de restaurar no canto superior direito */}
        <button
          onClick={onRestore}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.9) rotate(180deg)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#666';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#333';
          }}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '2px solid #666',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            transform: 'scale(1) rotate(0deg)'
          }}
        >
          ↻
        </button>

        {/* Título centralizado */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          width: 'calc(100% - 60px)',
          marginLeft: '30px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#333' 
          }}>
            Edição de Valores Base
          </h3>
        </div>

        {/* Linha separadora após título */}
        <div style={{
          height: '1px',
          backgroundColor: '#d3d3d3',
          margin: '4px 0',
          marginBottom: '20px'
        }}></div>

        {/* Conteúdo */}
        <div>
          {/* Campo Base MVA */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <label style={{ 
              minWidth: '90px', 
              marginRight: '10px', 
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#000'
            }}>
              Base MVA:
            </label>
            <NumericInput
              value={baseMVA}
              onChange={onChangeBaseMVA}
              min={1}
              step={1}
              style={{ flex: 1 }}
            />
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '12px', 
              color: '#666',
              minWidth: '40px'
            }}>
              MVA
            </span>
          </div>

          {/* Campo Base kV */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <label style={{ 
              minWidth: '90px', 
              marginRight: '10px', 
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#000'
            }}>
              Base kV:
            </label>
            <NumericInput
              value={baseKV}
              onChange={onChangeBaseKV}
              min={1}
              step={1}
              style={{ flex: 1 }}
            />
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '12px', 
              color: '#666',
              minWidth: '40px'
            }}>
              kV
            </span>
          </div>
        </div>

        {/* Linha separadora antes dos botões */}
        <div style={{
          height: '1px',
          backgroundColor: '#d3d3d3',
          margin: '4px 0',
          marginTop: '20px',
          marginBottom: '16px'
        }}></div>

        {/* Botões de ação */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#888',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '120px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#888';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#003366',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              width: '120px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#004488';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#003366';
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
