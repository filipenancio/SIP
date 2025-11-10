import React from 'react';
import { ReferenceBus, NormalBus, GeneratorIndicator, LoadIndicator, TransmissionLineNeutral } from './PowerSystemElements';
import { Bus } from './EditModalBus';
import { Generator } from './EditModalGenerator';
import { Branch } from './EditModalBranch';

interface BusPosition {
  x: number;
  y: number;
}

const busPositions: Record<number, BusPosition> = {
  1: { x: 250, y: 250 },
  2: { x: 550, y: 250 },
  3: { x: 400, y: 400 }
};

export interface LineResult {
  from: number;
  to: number;
  p_from_mw: number;
  q_from_mvar: number;
  p_to_mw: number;
  q_to_mvar: number;
  p_loss_mw: number;
  q_loss_mvar: number;
  loading_percent: number;
}

// Componente para Linha de Transmissão com Resultado (colorida)
const TransmissionLineResult: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  branch: Branch;
  lineResult: LineResult;
  onHover: (e: React.MouseEvent, show: boolean) => void;
  onClick?: () => void;
}> = ({ x1, y1, x2, y2, label, branch, lineResult, onHover, onClick }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Determinar a cor baseado no fluxo de potência
  // Fluxo positivo (from -> to) = verde, negativo = vermelho
  const isPositiveFlow = lineResult.p_from_mw >= 0;
  const lineColor = isPositiveFlow ? '#90EE90' : '#FFB6B6';
  const strokeColor = isPositiveFlow ? '#006400' : '#8B0000';
  const arrowColor = isPositiveFlow ? '#006400' : '#8B0000';

  // Calcular direção para as setas
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
        fill={arrowColor}
        stroke={arrowColor}
        strokeWidth="1"
      />
    );
  }

  return (
    <g onClick={onClick}>
      <rect
        x={midX - length / 2}
        y={midY - 7}
        width={length}
        height={14}
        fill={lineColor}
        stroke={strokeColor}
        strokeWidth="2"
        rx="3"
        transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${midX}, ${midY})`}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth="2"
      />
      {arrows}
      {label && (
        <text
          x={midX}
          y={midY - 15}
          textAnchor="middle"
          fill="#000"
          fontSize="12"
          fontWeight="bold"
        >
          {label}
        </text>
      )}
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
    </g>
  );
};

export interface Diagram3BusProps {
  buses: Bus[];
  generators: Generator[];
  branches: Branch[];
  lineResults?: LineResult[];
  isResultView?: boolean;
  onBusClick?: (bus: Bus) => void;
  onGeneratorClick?: (generator: Generator) => void;
  onBranchClick?: (branch: Branch) => void;
  onLoadClick?: (bus: Bus) => void;
  onBusHover?: (e: React.MouseEvent, show: boolean, bus?: Bus) => void;
  onGeneratorHover?: (e: React.MouseEvent, show: boolean, generator?: Generator) => void;
  onBranchHover?: (e: React.MouseEvent, show: boolean, branch?: Branch) => void;
  onLoadHover?: (e: React.MouseEvent, show: boolean, bus?: Bus) => void;
  hasDragged?: boolean;
}

export const Diagram3Bus: React.FC<Diagram3BusProps> = ({
  buses,
  generators,
  branches,
  lineResults,
  isResultView = false,
  onBusClick,
  onGeneratorClick,
  onBranchClick,
  onLoadClick,
  onBusHover,
  onGeneratorHover,
  onBranchHover,
  onLoadHover,
  hasDragged,
}) => {
  const hasGenerator = (busId: number): boolean => {
    return generators.some(gen => gen.bus === busId && gen.status === 1);
  };

  const getGenerator = (busId: number): Generator | undefined => {
    return generators.find(gen => gen.bus === busId && gen.status === 1);
  };

  const hasLoad = (busId: number): boolean => {
    const bus = buses.find(b => b.bus_i === busId);
    return bus ? (bus.Pd > 0 || bus.Qd > 0) : false;
  };

  const getLineResult = (fbus: number, tbus: number): LineResult | undefined => {
    if (!lineResults) return undefined;
    return lineResults.find(lr => 
      (lr.from === fbus && lr.to === tbus) ||
      (lr.from === tbus && lr.to === fbus)
    );
  };

  return (
    <>
      {/* Linhas de transmissão */}
      {branches.map((branch: Branch, index: number) => {
        const pos1 = busPositions[branch.fbus];
        const pos2 = busPositions[branch.tbus];
        if (!pos1 || !pos2) return null;

        if (isResultView && lineResults) {
          const lineResult = getLineResult(branch.fbus, branch.tbus);
          if (!lineResult) return null;

          return (
            <TransmissionLineResult
              key={index}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              label={`L${branch.fbus}-${branch.tbus}`}
              branch={branch}
              lineResult={lineResult}
              onHover={(e, show) => onBranchHover && onBranchHover(e, show, show ? branch : undefined)}
              onClick={() => {
                if (!hasDragged && onBranchClick) onBranchClick(branch);
              }}
            />
          );
        } else {
          return (
            <TransmissionLineNeutral
              key={index}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              label={`L${branch.fbus}-${branch.tbus}`}
              branch={branch}
              onHover={(e, show) => onBranchHover && onBranchHover(e, show, show ? branch : undefined)}
              onClick={() => {
                if (!hasDragged && onBranchClick) onBranchClick(branch);
              }}
            />
          );
        }
      })}

      {/* Barras */}
      {buses.map((bus: Bus) => {
        const pos = busPositions[bus.bus_i];
        if (!pos) return null;
        
        const BusComponent = bus.type === 3 ? ReferenceBus : NormalBus;
        return (
          <BusComponent
            key={bus.bus_i}
            x={pos.x}
            y={pos.y}
            label={`Barra ${bus.bus_i}`}
            bus={bus}
            onHover={(e, show) => onBusHover && onBusHover(e, show, show ? bus : undefined)}
            onClick={() => {
              if (!hasDragged && onBusClick) onBusClick(bus);
            }}
          />
        );
      })}

      {/* Indicadores de gerador */}
      {buses.map((bus: Bus) => {
        const pos = busPositions[bus.bus_i];
        if (!pos) return null;
        
        const generator = getGenerator(bus.bus_i);
        if (!hasGenerator(bus.bus_i) || !generator) return null;
        
        return (
          <GeneratorIndicator
            key={`gen-${bus.bus_i}`}
            x={pos.x - 30}
            y={pos.y - 30}
            generator={generator}
            onHover={(e, show) => onGeneratorHover && onGeneratorHover(e, show, show ? generator : undefined)}
            onClick={() => {
              if (!hasDragged && onGeneratorClick) onGeneratorClick(generator);
            }}
          />
        );
      })}

      {/* Indicadores de carga */}
      {buses.map((bus: Bus) => {
        const pos = busPositions[bus.bus_i];
        if (!pos) return null;
        
        if (!hasLoad(bus.bus_i)) return null;
        
        return (
          <LoadIndicator
            key={`load-${bus.bus_i}`}
            x={pos.x + 30}
            y={pos.y - 30}
            bus={bus}
            onHover={(e, show) => onLoadHover && onLoadHover(e, show, show ? bus : undefined)}
            onClick={() => {
              if (!hasDragged && onLoadClick) onLoadClick(bus);
            }}
          />
        );
      })}
    </>
  );
};
