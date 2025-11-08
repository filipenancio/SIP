import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Tipos baseados no formato MATPOWER
interface Bus {
  bus_i: number;
  type: number; // 1=PQ, 2=PV, 3=ref
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
  hasGenerator: boolean;
}

interface Generator {
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
}

interface Branch {
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
}

interface MPC {
  version: string;
  baseMVA: number;
  bus: Bus[];
  gen: Generator[];
  branch: Branch[];
}

// Dados originais do case3p.m (sistema imutável para backup)
const sistemaOriginal: MPC = {
  version: '2',
  baseMVA: 100,
  bus: [
    { bus_i: 1, type: 3, Pd: 0.0, Qd: 0.0, Gs: 0, Bs: 0, area: 1, Vm: 1.05, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: true },
    { bus_i: 2, type: 1, Pd: 40.0, Qd: 20.0, Gs: 0, Bs: 0, area: 1, Vm: 1.0, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: false },
    { bus_i: 3, type: 2, Pd: 25.0, Qd: 15.0, Gs: 0, Bs: 0, area: 1, Vm: 1.04, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: true }
  ],
  gen: [
    { bus: 3, Pg: 35, Qg: 0, Qmax: 100, Qmin: -100, Vg: 1.02, mBase: 100, status: 1, Pmax: 50, Pmin: 0 },
    { bus: 1, Pg: 0, Qg: 0, Qmax: 100, Qmin: -100, Vg: 1, mBase: 100, status: 1, Pmax: 0, Pmin: 0 }
  ],
  branch: [
    { fbus: 1, tbus: 2, r: 0.01, x: 0.06, b: 0.03, rateA: 250, rateB: 250, rateC: 250, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360 },
    { fbus: 1, tbus: 3, r: 0.02, x: 0.08, b: 0.025, rateA: 250, rateB: 250, rateC: 250, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360 },
    { fbus: 2, tbus: 3, r: 0.015, x: 0.07, b: 0.02, rateA: 250, rateB: 250, rateC: 250, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360 }
  ]
};

// Função auxiliar para criar deep copy do sistema original
const createDeepCopy = (obj: MPC): MPC => {
  return JSON.parse(JSON.stringify(obj));
};

// Componente para Tooltip
const Tooltip: React.FC<{ 
  show: boolean; 
  x: number; 
  y: number; 
  content: React.ReactNode;
}> = ({ show, x, y, content }) => {
  if (!show) return null;
  
  return (
    <div style={{
      position: 'fixed',
      left: x + 10,
      top: y - 10,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000,
      pointerEvents: 'none',
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      {content}
    </div>
  );
};

// Componente para Barra de Referência
export const ReferenceBus: React.FC<{ 
  x: number; 
  y: number; 
  label?: string; 
  bus: Bus;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x, y, label, bus, onHover, onClick }) => (
  <g 
    onMouseEnter={(e) => onHover(e, true)}
    onMouseLeave={(e) => onHover(e, false)}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <circle cx={x} cy={y} r="25" fill="#4169E1" stroke="#000" strokeWidth="3" />
    <circle cx={x} cy={y} r="12" fill="#000" />
    {label && (
      <text x={x} y={y + 50} textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold">
        {label}
      </text>
    )}
  </g>
);

// Componente para Barra Normal
export const NormalBus: React.FC<{ 
  x: number; 
  y: number; 
  label?: string; 
  bus: Bus;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x, y, label, bus, onHover, onClick }) => (
  <g 
    onMouseEnter={(e) => onHover(e, true)}
    onMouseLeave={(e) => onHover(e, false)}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <circle cx={x} cy={y} r="25" fill="#4169E1" stroke="#000" strokeWidth="3" />
    {label && (
      <text x={x} y={y + 50} textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold">
        {label}
      </text>
    )}
  </g>
);

// Componente para Indicativo de Barra Geradora
export const GeneratorIndicator: React.FC<{ 
  x: number; 
  y: number; 
  generator: Generator;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x, y, generator, onHover, onClick }) => (
  <g 
    onMouseEnter={(e) => onHover(e, true)}
    onMouseLeave={(e) => onHover(e, false)}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <rect x={x - 15} y={y - 15} width="30" height="30" fill="#32CD32" stroke="#000" strokeWidth="2" rx="3" />
    <polygon 
      points={`${x-8},${y+5} ${x},${y-8} ${x+8},${y+5}`} 
      fill="#FFD700" 
      stroke="#000" 
      strokeWidth="1"
    />
  </g>
);

// Componente para Indicativo de Barra com Carga
export const LoadIndicator: React.FC<{ 
  x: number; 
  y: number; 
  bus: Bus;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x, y, bus, onHover, onClick }) => (
  <g 
    onMouseEnter={(e) => onHover(e, true)}
    onMouseLeave={(e) => onHover(e, false)}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <rect x={x - 15} y={y - 15} width="30" height="30" fill="#FFB6C1" stroke="#000" strokeWidth="2" rx="3" />
    <rect x={x - 8} y={y - 8} width="16" height="12" fill="#8B4513" stroke="#000" strokeWidth="1" />
    <rect x={x - 6} y={y - 6} width="4" height="8" fill="#654321" />
    <rect x={x - 2} y={y - 6} width="4" height="8" fill="#654321" />
    <rect x={x + 2} y={y - 6} width="4" height="8" fill="#654321" />
  </g>
);

// Componente para Linha de Transmissão Neutra (pré-simulação)
export const TransmissionLineNeutral: React.FC<{ 
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number; 
  label?: string; 
  branch: Branch;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x1, y1, x2, y2, label, branch, onHover, onClick }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Calcular direção para as setas (de fbus para tbus)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;
  
  const arrows = [];
  const numArrows = 4;
  const arrowSpacing = length / (numArrows + 1);
  
  for (let i = 1; i <= numArrows; i++) {
    const arrowX = x1 + unitX * arrowSpacing * i;
    const arrowY = y1 + unitY * arrowSpacing * i;
    const arrowSize = 8;
    
    // Pontos da seta
    const tipX = arrowX + unitX * arrowSize;
    const tipY = arrowY + unitY * arrowSize;
    const leftX = arrowX - unitX * arrowSize + unitY * arrowSize * 0.5;
    const leftY = arrowY - unitY * arrowSize - unitX * arrowSize * 0.5;
    const rightX = arrowX - unitX * arrowSize - unitY * arrowSize * 0.5;
    const rightY = arrowY - unitY * arrowSize + unitX * arrowSize * 0.5;
    
    arrows.push(
      <polygon
        key={i}
        points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
        fill="#000"
        stroke="#000"
        strokeWidth="1"
      />
    );
  }
  
  return (
    <g onClick={onClick}>
      {/* Área de hover invisível mais larga */}
      <line 
        x1={x1} 
        y1={y1} 
        x2={x2} 
        y2={y2} 
        stroke="transparent" 
        strokeWidth="15"
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => onHover(e, true)}
        onMouseLeave={(e) => onHover(e, false)}
      />
      
      {/* Linha cinza claro (base) */}
      <line 
        x1={x1} 
        y1={y1} 
        x2={x2} 
        y2={y2} 
        stroke="#D3D3D3" 
        strokeWidth="9"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Linha preta por cima (com as setas) */}
      <line 
        x1={x1} 
        y1={y1} 
        x2={x2} 
        y2={y2} 
        stroke="#000" 
        strokeWidth="4"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Setas */}
      {arrows}
      
      {/* Label com hover */}
      {label && (
        <text 
          x={midX} 
          y={midY - 15} 
          textAnchor="middle" 
          fill="#000" 
          fontSize="12" 
          fontWeight="bold"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => onHover(e, true)}
          onMouseLeave={(e) => onHover(e, false)}
        >
          {label}
        </text>
      )}
    </g>
  );
};

// Componente Switch estilo iPhone
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

// Componente para o conteúdo do modal de edição
const EditModalContent: React.FC<{
  type: 'bus' | 'generator' | 'branch' | '';
  data: any;
  onChange: (newData: any) => void;
}> = ({ type, data, onChange }) => {
  if (!data) return null;

  const handleFieldChange = (field: string, value: string | number) => {
    const newData = { ...data };
    newData[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onChange(newData);
  };

  const renderField = (label: string, field: string, unit?: string) => (
    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
      <label style={{ 
        minWidth: '90px', 
        marginRight: '10px', 
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#000'
      }}>
        {label}:
      </label>
      <input
        type="number"
        step="0.001"
        value={data[field] || 0}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        style={{
          flex: 1,
          padding: '6px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      />
      {unit && (
        <span style={{ 
          marginLeft: '8px', 
          fontSize: '12px', 
          color: '#666',
          minWidth: '40px'
        }}>
          {unit}
        </span>
      )}
    </div>
  );

  if (type === 'bus') {
    const getBusTypeName = (busType: number) => {
      switch (busType) {
        case 3: return 'Referência (Slack)';
        case 2: return 'PV (Tensão Controlada)';
        case 1: return 'PQ (Carga)';
        default: return 'Desconhecido';
      }
    };

    return (
      <div>
        {/* Tipo da barra (somente leitura) */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '90px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Tipo:
          </label>
          <span style={{
            flex: 1,
            padding: '6px 8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            {getBusTypeName(data.type)}
          </span>
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#666',
            minWidth: '40px'
          }}>
            {/* Espaço para manter alinhamento com os outros campos */}
          </span>
        </div>

        {renderField('Tensão', 'Vm', 'pu')}
        {renderField('Ângulo', 'Va', '°')}
        {renderField('Pd', 'Pd', 'MW')}
        {renderField('Qd', 'Qd', 'MVAr')}
        {renderField('Base', 'baseKV', 'kV')}
        
        {/* Campo do gerador */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <label style={{ 
            minWidth: '90px', 
            marginRight: '10px', 
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000'
          }}>
            Gerador:
          </label>
          <ToggleSwitch
            checked={data.hasGenerator}
            onChange={(checked) => onChange({ ...data, hasGenerator: checked })}
            disabled={data.type === 3} // Barra slack sempre tem gerador
          />
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#666',
            minWidth: '40px'
          }}>
            {data.type === 3 ? '(obrigatório)' : ''}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'generator') {
    return (
      <div>
        {renderField('Pg', 'Pg', 'MW')}
        {renderField('Qg', 'Qg', 'MVAr')}
        {renderField('Pmax', 'Pmax', 'MW')}
        {renderField('Pmin', 'Pmin', 'MW')}
        {renderField('Qmax', 'Qmax', 'MVAr')}
        {renderField('Qmin', 'Qmin', 'MVAr')}
      </div>
    );
  }

  if (type === 'branch') {
    return (
      <div>
        {renderField('Resistência', 'r', 'pu')}
        {renderField('Reatância', 'x', 'pu')}
        {renderField('Susceptância', 'b', 'pu')}
        {renderField('Capacidade A', 'rateA', 'MVA')}
        {renderField('Capacidade B', 'rateB', 'MVA')}
        {renderField('Capacidade C', 'rateC', 'MVA')}
      </div>
    );
  }

  return null;
};

// Componente para o Diagrama do Sistema de 3 Barras
export const ThreeBusSystemDiagram: React.FC = () => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null as React.ReactNode });
  const [editModal, setEditModal] = useState({ 
    show: false, 
    type: '' as 'bus' | 'generator' | 'branch' | '', 
    data: null as any,
    originalData: null as any
  });
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [generatorEditConfirmModal, setGeneratorEditConfirmModal] = useState({ show: false, generator: null as Generator | null });
  const [sistemaState, setSistemaState] = useState(() => createDeepCopy(sistemaOriginal));
  const svgRef = useRef<SVGSVGElement>(null);

  // Posições das barras no diagrama
  const busPositions = {
    1: { x: 250, y: 250 },
    2: { x: 550, y: 250 },
    3: { x: 400, y: 400 }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.min(Math.max(prevZoom * delta, 0.5), 3));
  }, []);

  const handleTooltip = useCallback((e: React.MouseEvent, show: boolean, content?: React.ReactNode) => {
    if (show && content) {
      setTooltip({
        show: true,
        x: e.clientX,
        y: e.clientY,
        content
      });
    } else {
      setTooltip({ show: false, x: 0, y: 0, content: null });
    }
  }, []);

  const zoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 3));
  };

  const zoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom * 0.8, 0.5));
  };

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Funções para o modal de edição
  const openEditModal = (type: 'bus' | 'generator' | 'branch', data: any) => {
    setTooltip({ show: false, x: 0, y: 0, content: null });
    setEditModal({
      show: true,
      type,
      data: { ...data },
      originalData: { ...data }
    });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, type: '', data: null, originalData: null });
  };

  const saveEditModal = () => {
    if (!editModal.data) return;

    const newSistema = { ...sistemaState };
    let newGeneratorAdded: Generator | null = null;
    
    if (editModal.type === 'bus') {
      const busIndex = newSistema.bus.findIndex((b: Bus) => b.bus_i === editModal.data.bus_i);
      if (busIndex !== -1) {
        const originalBus = sistemaState.bus[busIndex];
        const updatedBus = editModal.data;
        
        // Verificar se o status do gerador mudou
        if (originalBus.hasGenerator !== updatedBus.hasGenerator) {
          if (updatedBus.hasGenerator) {
            // Gerador foi ativado - verificar se já existe
            const existingGenIndex = newSistema.gen.findIndex((g: Generator) => g.bus === updatedBus.bus_i);
            if (existingGenIndex === -1) {
              // Verificar se existe um gerador original para esta barra
              const originalBusFromSystem = sistemaOriginal.bus.find((b: Bus) => b.bus_i === updatedBus.bus_i);
              const originalGeneratorFromSystem = sistemaOriginal.gen.find((g: Generator) => g.bus === updatedBus.bus_i);
              
              let newGenerator: Generator;
              
              if (originalBusFromSystem?.hasGenerator && originalGeneratorFromSystem) {
                // Restaurar gerador original
                newGenerator = { ...originalGeneratorFromSystem };
              } else {
                // Criar novo gerador com valores padrão
                newGenerator = {
                  bus: updatedBus.bus_i,
                  Pg: 0,
                  Qg: 0,
                  Qmax: 100,
                  Qmin: -100,
                  Vg: 1.0,
                  mBase: 100,
                  status: 1,
                  Pmax: 100,
                  Pmin: 0
                };
              }
              
              newSistema.gen.push(newGenerator);
              newGeneratorAdded = newGenerator;
            }
          } else {
            // Gerador foi desativado - remover da lista (apenas se não for barra slack)
            if (updatedBus.type !== 3) {
              const genIndex = newSistema.gen.findIndex((g: Generator) => g.bus === updatedBus.bus_i);
              if (genIndex !== -1) {
                newSistema.gen.splice(genIndex, 1);
              }
            }
          }
        }
        
        newSistema.bus[busIndex] = updatedBus;
      }
    } else if (editModal.type === 'generator') {
      const genIndex = newSistema.gen.findIndex((g: Generator) => g.bus === editModal.data.bus);
      if (genIndex !== -1) {
        newSistema.gen[genIndex] = editModal.data;
      }
    } else if (editModal.type === 'branch') {
      const branchIndex = newSistema.branch.findIndex((b: Branch) => 
        b.fbus === editModal.data.fbus && b.tbus === editModal.data.tbus
      );
      if (branchIndex !== -1) {
        newSistema.branch[branchIndex] = editModal.data;
      }
    }

    setSistemaState(newSistema);
    closeEditModal();
    
    // Se um novo gerador foi adicionado, perguntar se quer editar
    if (newGeneratorAdded) {
      setGeneratorEditConfirmModal({ show: true, generator: newGeneratorAdded });
    }
  };

  const restoreOriginalData = () => {
    if (editModal.originalData) {
      setConfirmModal({ show: true });
    }
  };

  const confirmRestore = () => {
    if (editModal.originalData) {
      if (editModal.type === 'bus') {
        // Restaurar dados da barra do sistema original
        const originalBus = sistemaOriginal.bus.find((b: Bus) => b.bus_i === editModal.originalData.bus_i);
        if (originalBus) {
          // Criar uma cópia completa dos dados originais da barra, incluindo hasGenerator
          const restoredBusData = { ...originalBus };
          
          setEditModal(prev => ({
            ...prev,
            data: restoredBusData
          }));
          
          // Se a barra originalmente tinha gerador, também restaurar o gerador no sistema
          if (originalBus.hasGenerator) {
            const originalGenerator = sistemaOriginal.gen.find((g: Generator) => g.bus === originalBus.bus_i);
            if (originalGenerator) {
              const newSistema = { ...sistemaState };
              const genIndex = newSistema.gen.findIndex((g: Generator) => g.bus === originalBus.bus_i);
              
              if (genIndex !== -1) {
                // Substituir gerador existente pelo original
                newSistema.gen[genIndex] = { ...originalGenerator };
              } else {
                // Adicionar gerador original se não existir
                newSistema.gen.push({ ...originalGenerator });
              }
              
              setSistemaState(newSistema);
            }
          } else {
            // Se a barra originalmente não tinha gerador, remover qualquer gerador existente
            const newSistema = { ...sistemaState };
            const genIndex = newSistema.gen.findIndex((g: Generator) => g.bus === originalBus.bus_i);
            if (genIndex !== -1) {
              newSistema.gen.splice(genIndex, 1);
              setSistemaState(newSistema);
            }
          }
        }
      } else if (editModal.type === 'generator') {
        // Restaurar dados do gerador do sistema original
        const originalGenerator = sistemaOriginal.gen.find((g: Generator) => g.bus === editModal.originalData.bus);
        if (originalGenerator) {
          const restoredGeneratorData = { ...originalGenerator };
          
          setEditModal(prev => ({
            ...prev,
            data: restoredGeneratorData
          }));
        }
      } else if (editModal.type === 'branch') {
        // Restaurar dados da linha do sistema original
        const originalBranch = sistemaOriginal.branch.find((b: Branch) => 
          b.fbus === editModal.originalData.fbus && b.tbus === editModal.originalData.tbus
        );
        if (originalBranch) {
          const restoredBranchData = { ...originalBranch };
          
          setEditModal(prev => ({
            ...prev,
            data: restoredBranchData
          }));
        }
      }
    }
    setConfirmModal({ show: false });
  };

  const cancelRestore = () => {
    setConfirmModal({ show: false });
  };

  const confirmEditGenerator = () => {
    if (generatorEditConfirmModal.generator) {
      openEditModal('generator', generatorEditConfirmModal.generator);
    }
    setGeneratorEditConfirmModal({ show: false, generator: null });
  };

  const cancelEditGenerator = () => {
    setGeneratorEditConfirmModal({ show: false, generator: null });
  };

  // Função para gerar mensagem de restauração baseada no tipo
  const getRestoreMessage = () => {
    if (!editModal.type) return { title: 'Confirmar Restauração', message: 'Tem certeza que deseja restaurar os dados originais?' };
    
    switch (editModal.type) {
      case 'bus':
        return {
          title: `Restauração da Barra ${editModal.data?.bus_i}`,
          message: `Tem certeza que deseja restaurar a Barra?<br/><br/>Obs.: Todos os parâmetros da barra e seu gerador (se houver) voltarão ao estado inicial.`
        };
      case 'generator':
        return {
          title: `Restauração do Gerador (Barra ${editModal.data?.bus})`,
          message: `Tem certeza que deseja restaurar o Gerador?<br/><br/>Obs.: Todos os parâmetros de geração voltarão ao estado inicial.`
        };
      case 'branch':
        return {
          title: `Restauração da Linha (L${editModal.data?.fbus}-${editModal.data?.tbus})`,
          message: `Tem certeza que deseja restaurar a Linha?<br/><br/>Obs.: Todos os parâmetros elétricos voltarão ao estado inicial.`
        };
      default:
        return {
          title: 'Confirmar Restauração',
          message: 'Tem certeza que deseja restaurar os dados originais?'
        };
    }
  };

  // Função para verificar se uma barra tem gerador
  const hasGenerator = (busNumber: number) => {
    return sistemaState.gen.some((gen: Generator) => gen.bus === busNumber && gen.status === 1);
  };

  // Função para verificar se uma barra tem carga
  const hasLoad = (busNumber: number) => {
    const bus = sistemaState.bus.find((b: Bus) => b.bus_i === busNumber);
    return bus && bus.Pd > 0;
  };

  // Função para obter dados do gerador
  const getGenerator = (busNumber: number) => {
    return sistemaState.gen.find((gen: Generator) => gen.bus === busNumber && gen.status === 1);
  };

  // Função para criar tooltip de barra
  const createBusTooltip = (bus: Bus) => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Barra {bus.bus_i}</div>
      <div>Tipo: {bus.type === 3 ? 'Referência (Slack)' : bus.type === 2 ? 'PV (Tensão Controlada)' : 'PQ (Carga)'}</div>
      <div>Tensão: {bus.Vm.toFixed(3)} pu</div>
      <div>Ângulo: {bus.Va.toFixed(2)}°</div>
      <div>Pd: {bus.Pd.toFixed(1)} MW</div>
      <div>Qd: {bus.Qd.toFixed(1)} MVAr</div>
      <div>Base: {bus.baseKV} kV</div>
    </div>
  );

  // Função para criar tooltip de gerador
  const createGeneratorTooltip = (gen: Generator) => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Gerador - Barra {gen.bus}</div>
      <div>Pg: {gen.Pg.toFixed(1)} MW</div>
      <div>Qg: {gen.Qg.toFixed(1)} MVAr</div>
      <div>Pmax: {gen.Pmax.toFixed(1)} MW</div>
      <div>Pmin: {gen.Pmin.toFixed(1)} MW</div>
      <div>Qmax: {gen.Qmax.toFixed(1)} MVAr</div>
      <div>Qmin: {gen.Qmin.toFixed(1)} MVAr</div>
      <div>Status: {gen.status === 1 ? 'Ativo' : 'Inativo'}</div>
    </div>
  );

  // Função para criar tooltip de linha
  const createBranchTooltip = (branch: Branch) => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Linha {branch.fbus} → {branch.tbus}</div>
      <div>Resistência: {branch.r.toFixed(4)} pu</div>
      <div>Reatância: {branch.x.toFixed(4)} pu</div>
      <div>Susceptância: {branch.b.toFixed(4)} pu</div>
      <div>Rating A: {branch.rateA.toFixed(0)} MVA</div>
      <div>Status: {branch.status === 1 ? 'Ativo' : 'Inativo'}</div>
    </div>
  );

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      maxHeight: '480px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #ddd',
      cursor: isDragging ? 'grabbing' : 'grab'
    }}>
      {/* Tooltip */}
      <Tooltip {...tooltip} />

      {/* Controles de Zoom */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button onClick={zoomIn} style={{
          width: '30px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>+</button>
        <button onClick={zoomOut} style={{
          width: '30px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>−</button>
        <button onClick={resetView} style={{
          width: '30px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '10px',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>⌂</button>
      </div>

      {/* Legenda fixa */}
      <div style={{
        position: 'absolute', top: '15px', left: '15px', zIndex: 10,
        backgroundColor: 'rgba(245, 245, 245, 0.95)', border: '1px solid #ccc',
        borderRadius: '4px', padding: '12px', width: '170px', fontSize: '9px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', marginBottom: '10px', color: '#333' }}>Legenda</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <svg width="22" height="18" style={{ marginRight: '10px' }}>
            <circle cx="11" cy="9" r="8" fill="#4169E1" stroke="#000" strokeWidth="1" />
            <circle cx="11" cy="9" r="4" fill="#000" />
          </svg>
          <span style={{ color: '#333' }}>Barra de Referência</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <svg width="22" height="18" style={{ marginRight: '10px' }}>
            <circle cx="11" cy="9" r="8" fill="#4169E1" stroke="#000" strokeWidth="1" />
          </svg>
          <span style={{ color: '#333' }}>Barra</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <svg width="22" height="18" style={{ marginRight: '10px' }}>
            <rect x="4" y="3" width="15" height="13" fill="#32CD32" stroke="#000" strokeWidth="1" rx="2" />
            <polygon points="7,12 11,5 15,12" fill="#FFD700" stroke="#000" strokeWidth="0.5" />
          </svg>
          <span style={{ color: '#333' }}>Barra geradora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <svg width="22" height="18" style={{ marginRight: '10px' }}>
            <rect x="4" y="3" width="15" height="13" fill="#FFB6C1" stroke="#000" strokeWidth="1" rx="2" />
            <rect x="6" y="5" width="11" height="7" fill="#8B4513" stroke="#000" strokeWidth="0.5" />
            <rect x="7" y="6" width="2" height="5" fill="#654321" />
            <rect x="9.5" y="6" width="2" height="5" fill="#654321" />
            <rect x="12" y="6" width="2" height="5" fill="#654321" />
          </svg>
          <span style={{ color: '#333' }}>Barra com carga</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="22" height="18" style={{ marginRight: '10px' }}>
            <rect x="2" y="7" width="19" height="5" fill="#D3D3D3" stroke="#A9A9A9" strokeWidth="1" rx="2" />
            <line x1="3" y1="9.5" x2="18" y2="9.5" stroke="#000" strokeWidth="1" />
            <polygon points="16,9.5 14,8 14,11" fill="#000" stroke="#000" strokeWidth="0.5" />
          </svg>
          <span style={{ color: '#333' }}>Linha de transmissão</span>
        </div>
      </div>

      {/* Diagrama */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg 
          ref={svgRef}
          width="800" 
          height="600" 
          viewBox="0 0 800 600" 
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <rect width="800" height="600" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          
          {/* Linhas de transmissão */}
          {sistemaState.branch.map((branch: Branch, index: number) => {
            const pos1 = busPositions[branch.fbus as keyof typeof busPositions];
            const pos2 = busPositions[branch.tbus as keyof typeof busPositions];
            return (
              <TransmissionLineNeutral
                key={index}
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                label={`L${branch.fbus}-${branch.tbus}`}
                branch={branch}
                onHover={(e, show) => handleTooltip(e, show, show ? createBranchTooltip(branch) : undefined)}
                onClick={() => openEditModal('branch', branch)}
              />
            );
          })}
          
          {/* Barras */}
          {sistemaState.bus.map((bus: Bus) => {
            const pos = busPositions[bus.bus_i as keyof typeof busPositions];
            const BusComponent = bus.type === 3 ? ReferenceBus : NormalBus;
            return (
              <BusComponent
                key={bus.bus_i}
                x={pos.x}
                y={pos.y}
                label={`Barra ${bus.bus_i}`}
                bus={bus}
                onHover={(e, show) => handleTooltip(e, show, show ? createBusTooltip(bus) : undefined)}
                onClick={() => openEditModal('bus', bus)}
              />
            );
          })}
          
          {/* Indicadores de gerador */}
          {sistemaState.bus.map((bus: Bus) => {
            const pos = busPositions[bus.bus_i as keyof typeof busPositions];
            const generator = getGenerator(bus.bus_i);
            if (!hasGenerator(bus.bus_i) || !generator) return null;
            return (
              <GeneratorIndicator
                key={`gen-${bus.bus_i}`}
                x={pos.x - 30}
                y={pos.y - 30}
                generator={generator}
                onHover={(e, show) => handleTooltip(e, show, show ? createGeneratorTooltip(generator) : undefined)}
                onClick={() => openEditModal('generator', generator)}
              />
            );
          })}
          
          {/* Indicadores de carga */}
          {sistemaState.bus.map((bus: Bus) => {
            const pos = busPositions[bus.bus_i as keyof typeof busPositions];
            if (!hasLoad(bus.bus_i)) return null;
            return (
              <LoadIndicator
                key={`load-${bus.bus_i}`}
                x={pos.x + 30}
                y={pos.y - 30}
                bus={bus}
                onHover={(e, show) => handleTooltip(e, show, show ? createBusTooltip(bus) : undefined)}
                onClick={() => openEditModal('bus', bus)}
              />
            );
          })}
        </svg>
      </div>

      {/* Modal de Edição */}
      {editModal.show && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(64, 64, 64, 0.8)',
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
            {/* Botão de restaurar dados originais */}
            <button
              onClick={restoreOriginalData}
              title="Restaurar dados originais"
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
              width: 'calc(100% - 60px)', // Compensa o espaço do botão de restaurar (30px + 15px margin de cada lado)
              marginLeft: '30px' // Centraliza considerando o botão
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#333' 
              }}>
                {editModal.type === 'bus' && `Edição de Barra (Barra ${editModal.data?.bus_i})`}
                {editModal.type === 'generator' && `Edição de Gerador (Barra ${editModal.data?.bus})`}
                {editModal.type === 'branch' && `Edição de Linha (L${editModal.data?.fbus}-${editModal.data?.tbus})`}
              </h3>
            </div>

            {/* Linha separadora após título */}
            <div style={{
              height: '1px',
              backgroundColor: '#d3d3d3',
              margin: '4px 0',
              marginBottom: '20px'
            }}></div>

            <EditModalContent 
              type={editModal.type}
              data={editModal.data}
              onChange={(newData) => setEditModal(prev => ({ ...prev, data: newData }))}
            />

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
                onClick={closeEditModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b0b0b0';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#c8c8c8ff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c8c8c8ff',
                  color: '#cd4444ff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '100px',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveEditModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '100px',
                  transition: 'all 0.2s ease'
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação */}
      {confirmModal.show && createPortal(
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
          zIndex: 9999999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            minWidth: '350px',
            maxWidth: '450px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#333' 
            }}>
              {getRestoreMessage().title}
            </h3>

            {/* Linha separadora após título */}
            <div style={{
              height: '1px',
              backgroundColor: '#d3d3d3',
              margin: '4px 0',
              marginBottom: '20px'
            }}></div>
            
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4'
            }} dangerouslySetInnerHTML={{ __html: getRestoreMessage().message }}>
            </p>

            {/* Linha separadora antes dos botões */}
            <div style={{
              height: '1px',
              backgroundColor: '#d3d3d3',
              margin: '4px 0',
              marginTop: '20px',
              marginBottom: '16px'
            }}></div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={cancelRestore}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b0b0b0';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#c8c8c8';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c8c8c8',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '90px',
                  transition: 'all 0.2s ease'
                }}
              >
                Não
              </button>
              <button
                onClick={confirmRestore}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '90px',
                  transition: 'all 0.2s ease'
                }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação de Edição do Gerador */}
      {generatorEditConfirmModal.show && createPortal(
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
          zIndex: 9999999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            minWidth: '350px',
            maxWidth: '450px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#333' 
            }}>
              Gerador Adicionado
            </h3>
            
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              Um novo gerador foi adicionado à Barra {generatorEditConfirmModal.generator?.bus} com valores padrão.<br/>
              Deseja editar os parâmetros do gerador agora?
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={cancelEditGenerator}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b0b0b0';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#c8c8c8';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c8c8c8',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '90px',
                  transition: 'all 0.2s ease'
                }}
              >
                Não
              </button>
              <button
                onClick={confirmEditGenerator}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '90px',
                  transition: 'all 0.2s ease'
                }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Tooltip */}
      <Tooltip 
        show={tooltip.show} 
        x={tooltip.x} 
        y={tooltip.y} 
        content={tooltip.content} 
      />
    </div>
  );
};