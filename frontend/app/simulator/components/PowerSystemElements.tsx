import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MessageModal from './MessageModal';
import { EditModalBus, type Bus } from './EditModalBus';
import { EditModalGenerator, type Generator } from './EditModalGenerator';
import { EditModalBranch, type Branch } from './EditModalBranch';
import { EditModalBaseValues } from './EditModalBaseValues';

// Tipos baseados no formato MATPOWER
// Bus, Generator e Branch são importados dos componentes

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
    { bus_i: 1, type: 3, Pd: 0.0, Qd: 0.0, Gs: 0, Bs: 0, area: 1, Vm: 1.0, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: true },
    { bus_i: 2, type: 2, Pd: 50.0, Qd: 25.0, Gs: 0, Bs: 0, area: 1, Vm: 1.0, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: true },
    { bus_i: 3, type: 1, Pd: 40.0, Qd: 30.0, Gs: 0, Bs: 0, area: 1, Vm: 1.0, Va: 0.0, baseKV: 230, zone: 1, Vmax: 1.1, Vmin: 0.9, hasGenerator: true }
  ],
  gen: [
    { bus: 1, Pg: 0, Qg: 0, Qmax: 30, Qmin: -30, Vg: 1, mBase: 100, status: 1, Pmax: 500, Pmin: 0 },
    { bus: 2, Pg: 30, Qg: 0, Qmax: 127.5, Qmin: -127.5, Vg: 1, mBase: 100, status: 1, Pmax: 300, Pmin: 0 },
    { bus: 3, Pg: 0, Qg: 0, Qmax: 390, Qmin: -390, Vg: 1, mBase: 100, status: 1, Pmax: 300, Pmin: 0 }
  ],
  branch: [
    { fbus: 1, tbus: 2, r: 0.0, x: 0.2, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 1, tbus: 3, r: 0.0, x: 0.4, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 },
    { fbus: 2, tbus: 3, r: 0.0, x: 0.25, b: 0.0, rateA: 0, rateB: 0, rateC: 0, ratio: 0, angle: 0, status: 1, angmin: -360, angmax: 360, baseMVA: 100 }
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

// Componente para o Diagrama do Sistema de 3 Barras
export const ThreeBusSystemDiagram: React.FC = () => {
  // Posições das barras no diagrama
  const busPositions = {
    1: { x: 250, y: 250 },
    2: { x: 550, y: 250 },
    3: { x: 400, y: 400 }
  };

  // Calcular centro e zoom inicial
  const calculateInitialView = () => {
    const positions = Object.values(busPositions);
    
    // Calcular limites do diagrama com margem menor para elementos externos
    const margin = 80; // Margem reduzida
    const minX = Math.min(...positions.map(p => p.x)) - margin;
    const maxX = Math.max(...positions.map(p => p.x)) + margin;
    const minY = Math.min(...positions.map(p => p.y)) - margin;
    const maxY = Math.max(...positions.map(p => p.y)) + margin;
    
    // Dimensões do diagrama
    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    const diagramCenterX = (minX + maxX) / 2;
    const diagramCenterY = (minY + maxY) / 2;
    
    // Dimensões do viewBox (1200x800)
    const viewBoxWidth = 1200;
    const viewBoxHeight = 800;
    const viewBoxCenterX = viewBoxWidth / 2;
    const viewBoxCenterY = viewBoxHeight / 2;
    
    // Calcular zoom mais conservador (usar 60% da tela)
    const zoomX = (viewBoxWidth * 0.6) / diagramWidth;
    const zoomY = (viewBoxHeight * 0.6) / diagramHeight;
    const optimalZoom = Math.min(zoomX, zoomY, 1.2); // Limitar zoom a 1.2
    
    // Dimensões DIV disponibilizada para diagrama
    const divWidth = 1200;
    const divHeight = 480;

    // Correção para centralização do diagrama na DIV
    const ajustWidth = (viewBoxWidth - divWidth)/2;
    const ajustHeight = (viewBoxHeight - divHeight)/2;

    // Calcular pan para centralizar perfeitamente no viewBox
    const panX = viewBoxCenterX - (diagramCenterX * optimalZoom) - ajustWidth;
    const panY = viewBoxCenterY - (diagramCenterY * optimalZoom) - ajustHeight; // Ajuste para subir o diagrama
    
    return { 
      pan: { x: panX, y: panY }, 
      zoom: optimalZoom,
      centerX: diagramCenterX,
      centerY: diagramCenterY
    };
  };

  const initialView = calculateInitialView();
  
  const [pan, setPan] = useState(initialView.pan);
  const [zoom, setZoom] = useState(initialView.zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null as React.ReactNode });
  const [editModal, setEditModal] = useState({ 
    show: false, 
    type: '' as 'bus' | 'generator' | 'branch' | '', 
    data: null as any,
    originalData: null as any
  });
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [confirmBaseRestoreModal, setConfirmBaseRestoreModal] = useState({ show: false });
  const [generatorEditConfirmModal, setGeneratorEditConfirmModal] = useState({ show: false, generator: null as Generator | null });
  const [sistemaState, setSistemaState] = useState(() => createDeepCopy(sistemaOriginal));
  const [baseModal, setBaseModal] = useState({
    show: false,
    baseMVA: sistemaOriginal.baseMVA,
    baseKV: sistemaOriginal.bus[0]?.baseKV || 230,
    originalBaseMVA: sistemaOriginal.baseMVA,
    originalBaseKV: sistemaOriginal.bus[0]?.baseKV || 230
  });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setHasDragged(true);
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
    
    if(e.deltaY > 0) 
      return zoomOut(); 
    
    return zoomIn(); 
  }, [zoom, pan]); // Adicionar dependências para que o callback seja atualizado

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
    const centerX = 600; // Centro do viewBox
    const centerY = 400;
    const zoomFactor = 1.1; // Fator de zoom
    
    // Calcular novos valores baseados nos estados atuais
    const currentZoom = zoom;
    const currentPan = pan;
    const newZoom = Math.min(currentZoom * zoomFactor, 3);
    
    console.log('=== ZOOM IN ===');
    console.log('currentZoom:', currentZoom, '-> newZoom:', newZoom);
    console.log('currentPan:', currentPan);
    console.log('centerX:', centerX, 'centerY:', centerY);
    
    // Ponto do diagrama que está no centro
    const diagramX = (centerX - currentPan.x) / currentZoom;
    const diagramY = (centerY - currentPan.y) / currentZoom;
    console.log('diagramX:', diagramX, 'diagramY:', diagramY);
    
    // Novo pan para manter esse ponto no centro
    const newPanX = centerX - diagramX * newZoom;
    const newPanY = centerY - diagramY * newZoom;
    console.log('newPan:', { x: newPanX, y: newPanY });
    console.log('delta pan:', { x: newPanX - currentPan.x, y: newPanY - currentPan.y });
    
    // Atualizar estados
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const zoomOut = () => {
    const centerX = 600;
    const centerY = 400;
    const zoomFactor = 1.1; // Mesmo fator do zoom in
    
    // Calcular novos valores baseados nos estados atuais
    const currentZoom = zoom;
    const currentPan = pan;
    const newZoom = Math.max(currentZoom / zoomFactor, 0.5); // Dividir em vez de multiplicar por 0.8
    
    console.log('=== ZOOM OUT ===');
    console.log('currentZoom:', currentZoom, '-> newZoom:', newZoom);
    console.log('currentPan:', currentPan);
    console.log('centerX:', centerX, 'centerY:', centerY);
    
    // Ponto do diagrama que está no centro
    const diagramX = (centerX - currentPan.x) / currentZoom;
    const diagramY = (centerY - currentPan.y) / currentZoom;
    console.log('diagramX:', diagramX, 'diagramY:', diagramY);
    
    // Novo pan para manter esse ponto no centro
    const newPanX = centerX - diagramX * newZoom;
    const newPanY = centerY - diagramY * newZoom;
    console.log('newPan:', { x: newPanX, y: newPanY });
    console.log('delta pan:', { x: newPanX - currentPan.x, y: newPanY - currentPan.y });
    
    // Atualizar estados
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const resetView = () => {
    const view = calculateInitialView();
    setPan(view.pan);
    setZoom(view.zoom);
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

  // Funções para o modal de bases
  const openBaseModal = () => {
    setBaseModal({
      show: true,
      baseMVA: sistemaState.baseMVA,
      baseKV: sistemaState.bus[0]?.baseKV || 230,
      originalBaseMVA: sistemaOriginal.baseMVA,
      originalBaseKV: sistemaOriginal.bus[0]?.baseKV || 230
    });
  };

  const closeBaseModal = () => {
    // Ao fechar o modal, restaurar os valores do sistema atual (desfazer alterações não salvas)
    setBaseModal(prev => ({
      ...prev,
      show: false,
      baseMVA: sistemaState.baseMVA,
      baseKV: sistemaState.bus[0]?.baseKV || 230
    }));
  };

  const saveBaseModal = () => {
    const newSistema = { ...sistemaState };
    
    // Atualizar baseMVA do sistema
    newSistema.baseMVA = baseModal.baseMVA;
    
    // Atualizar mBase de todos os geradores com o novo baseMVA
    newSistema.gen = newSistema.gen.map((gen: Generator) => ({
      ...gen,
      mBase: baseModal.baseMVA
    }));
    
    // Atualizar baseKV em todas as barras
    newSistema.bus = newSistema.bus.map((bus: Bus) => ({
      ...bus,
      baseKV: baseModal.baseKV
    }));
    
    // Atualizar baseMVA em todas as linhas
    newSistema.branch = newSistema.branch.map((branch: Branch) => ({
      ...branch,
      baseMVA: baseModal.baseMVA
    }));
    
    setSistemaState(newSistema);
    closeBaseModal();
  };

  const restoreBaseValues = () => {
    setConfirmBaseRestoreModal({ show: true });
  };

  const confirmRestoreBaseValues = () => {
    setBaseModal(prev => ({
      ...prev,
      baseMVA: prev.originalBaseMVA,
      baseKV: prev.originalBaseKV
    }));
    setConfirmBaseRestoreModal({ show: false });
  };

  const cancelRestoreBaseValues = () => {
    setConfirmBaseRestoreModal({ show: false });
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
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Barra {bus.bus_i}</div>
      <div>Tipo: {bus.type === 3 ? 'Slack' : bus.type === 2 ? 'PV' : 'PQ'}</div>
      <div>Base kV: {bus.baseKV} kV</div>
      <div>Pd: {bus.Pd.toFixed(1)} MW</div>
      <div>Qd: {bus.Qd.toFixed(1)} MVAr</div>
      <div>V: {bus.Vm.toFixed(3)} pu</div>
      <div>θ: {bus.Va.toFixed(2)}°</div>
      <div>Vmax: {bus.Vmax.toFixed(2)} pu</div>
      <div>Vmin: {bus.Vmin.toFixed(2)} pu</div>
    </div>
  );

  // Função para criar tooltip de gerador
  const createGeneratorTooltip = (gen: Generator) => (
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Gerador - Barra {gen.bus}</div>
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
    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Linha {branch.fbus} → {branch.tbus}</div>
      <div>Base MVA: {branch.baseMVA || 100} MVA</div>
      <div>R: {branch.r.toFixed(4)} pu</div>
      <div>X: {branch.x.toFixed(4)} pu</div>
      <div>B: {branch.b.toFixed(4)} pu</div>
      <div>Rate A: {branch.rateA.toFixed(0)} MVA</div>
      <div>Rate B: {branch.rateB.toFixed(0)} MVA</div>
      <div>Rate C: {branch.rateC.toFixed(0)} MVA</div>
      <div>Tap: {branch.angle.toFixed(2)}°</div>
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

      {/* Informações Base */}
      <div 
        onClick={openBaseModal}
        style={{
          position: 'absolute', bottom: '15px', left: '15px', zIndex: 10,
          backgroundColor: 'rgba(245, 245, 245, 0.95)', border: '1px solid #ccc',
          borderRadius: '4px', padding: '12px', width: '170px', fontSize: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(230, 230, 230, 0.95)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 245, 245, 0.95)'}
      >
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', marginBottom: '10px', color: '#333' }}>Valores Base</div>
        <div style={{ marginBottom: '6px', color: '#333' }}>
          <span style={{ fontWeight: 'bold' }}>Base MVA:</span> {sistemaState.baseMVA} MVA
        </div>
        <div style={{ color: '#333' }}>
          <span style={{ fontWeight: 'bold' }}>Base kV:</span> {sistemaState.bus[0]?.baseKV || 230} kV
        </div>
      </div>

      {/* Diagrama */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox="0 0 1200 800" 
          style={{ 
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <rect width="1200" height="800" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          
          {/* Grupo com transformação para pan e zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
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
                onClick={() => {
                  if (!hasDragged) openEditModal('branch', branch);
                }}
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
                onClick={() => {
                  if (!hasDragged) openEditModal('bus', bus);
                }}
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
                onClick={() => {
                  if (!hasDragged) openEditModal('generator', generator);
                }}
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
                onClick={() => {
                  if (!hasDragged) openEditModal('bus', bus);
                }}
              />
            );
          })}
          </g>
        </svg>
      </div>

      {/* Modais de Edição */}
      <EditModalBus
        show={editModal.show && editModal.type === 'bus'}
        data={editModal.data}
        onClose={closeEditModal}
        onSave={saveEditModal}
        onRestore={restoreOriginalData}
        onChange={(newData) => setEditModal(prev => ({ ...prev, data: newData }))}
      />

      <EditModalGenerator
        show={editModal.show && editModal.type === 'generator'}
        data={editModal.data}
        onClose={closeEditModal}
        onSave={saveEditModal}
        onRestore={restoreOriginalData}
        onChange={(newData) => setEditModal(prev => ({ ...prev, data: newData }))}
      />

      <EditModalBranch
        show={editModal.show && editModal.type === 'branch'}
        data={editModal.data}
        onClose={closeEditModal}
        onSave={saveEditModal}
        onRestore={restoreOriginalData}
        onChange={(newData) => setEditModal(prev => ({ ...prev, data: newData }))}
      />

      {/* Modal de Edição de Bases */}
      <EditModalBaseValues
        show={baseModal.show}
        baseMVA={baseModal.baseMVA}
        baseKV={baseModal.baseKV}
        onClose={closeBaseModal}
        onSave={saveBaseModal}
        onRestore={restoreBaseValues}
        onChangeBaseMVA={(value) => setBaseModal(prev => ({ ...prev, baseMVA: value }))}
        onChangeBaseKV={(value) => setBaseModal(prev => ({ ...prev, baseKV: value }))}
      />

      <MessageModal
        show={confirmModal.show}
        title={getRestoreMessage().title}
        message={<span dangerouslySetInnerHTML={{ __html: getRestoreMessage().message }} />}
        buttons={[
          {
            label: 'Não',
            onClick: cancelRestore,
            variant: 'secondary'
          },
          {
            label: 'Sim',
            onClick: confirmRestore,
            variant: 'primary'
          }
        ]}
      />

      <MessageModal
        show={confirmBaseRestoreModal.show}
        title="Restauração dos Valores Base"
        message={
          <>
            Tem certeza que deseja restaurar os valores base?<br/><br/>
            Obs.: Os valores de Base MVA e Base kV voltarão ao estado inicial.
          </>
        }
        buttons={[
          {
            label: 'Não',
            onClick: cancelRestoreBaseValues,
            variant: 'secondary'
          },
          {
            label: 'Sim',
            onClick: confirmRestoreBaseValues,
            variant: 'primary'
          }
        ]}
      />

      <MessageModal
        show={generatorEditConfirmModal.show}
        title="Gerador Adicionado"
        message={
          <>
            Um novo gerador foi adicionado à Barra {generatorEditConfirmModal.generator?.bus} com valores padrão.<br/>
            Deseja editar os parâmetros do gerador agora?
          </>
        }
        buttons={[
          {
            label: 'Não',
            onClick: cancelEditGenerator,
            variant: 'secondary'
          },
          {
            label: 'Sim',
            onClick: confirmEditGenerator,
            variant: 'primary'
          }
        ]}
      />

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