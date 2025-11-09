import React from 'react';
import { createPortal } from 'react-dom';

interface MessageModalButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'cancel';
}

interface MessageModalProps {
  show: boolean;
  title: string;
  message: string | React.ReactNode;
  buttons: MessageModalButton[];
  onClose?: () => void;
}

export default function MessageModal({ show, title, message, buttons, onClose }: MessageModalProps) {
  if (!show || typeof window === 'undefined') return null;

  const getButtonStyle = (variant: 'primary' | 'secondary' | 'cancel' = 'primary') => {
    const baseStyle = {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      minWidth: '100px',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#003366',
          color: 'white'
        };
      case 'cancel':
        return {
          ...baseStyle,
          backgroundColor: '#c8c8c8ff',
          color: '#cd4444ff'
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#6c757d',
          color: 'white'
        };
      default:
        return baseStyle;
    }
  };

  const getButtonHoverStyle = (variant: 'primary' | 'secondary' | 'cancel' = 'primary') => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#004b8d' };
      case 'cancel':
        return { backgroundColor: '#b0b0b0' };
      case 'secondary':
        return { backgroundColor: '#5a6268' };
      default:
        return {};
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        minWidth: '350px',
        maxWidth: '450px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Título centralizado */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#333'
          }}>
            {title}
          </h3>
        </div>

        {/* Linha separadora após título */}
        <div style={{
          height: '1px',
          backgroundColor: '#d3d3d3',
          margin: '4px 0',
          marginBottom: '20px'
        }}></div>

        {/* Mensagem */}
        <div style={{
          textAlign: 'center',
          color: '#333',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '10px 0',
          whiteSpace: 'pre-line'
        }}>
          {typeof message === 'string' ? message : message}
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
          gap: '16px'
        }}>
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              onMouseEnter={(e) => {
                const hoverStyle = getButtonHoverStyle(button.variant);
                Object.assign(e.currentTarget.style, hoverStyle);
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const normalStyle = getButtonStyle(button.variant);
                if ('backgroundColor' in normalStyle) {
                  e.currentTarget.style.backgroundColor = normalStyle.backgroundColor;
                }
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={getButtonStyle(button.variant)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
