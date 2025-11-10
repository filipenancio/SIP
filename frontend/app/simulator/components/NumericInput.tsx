import React from 'react';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 0.01, 
  style, 
  disabled = false 
}) => {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
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
