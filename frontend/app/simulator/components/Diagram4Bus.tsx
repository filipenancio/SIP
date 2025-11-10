import React, { useMemo } from 'react';
import { ReferenceBus, NormalBus, GeneratorIndicator, LoadIndicator, TransmissionLineNeutral } from './PowerSystemElements';
import { Bus } from './EditModalBus';
import { Generator } from './EditModalGenerator';
import { Branch } from './EditModalBranch';
import { LineResult } from './Diagram3Bus';
import { calculateOptimalLabelPositions, calculateOptimalLineLabelPositions } from '../utils/LabelPositioning';

interface BusPosition {
  x: number;
  y: number;
}

// Posições para sistema de 4 barras (retangular com bom espaçamento)
export const busPositions4: Record<number, BusPosition> = {
  1: { x: 280, y: 200 },
  2: { x: 650, y: 200 },
  3: { x: 280, y: 450 },
  4: { x: 650, y: 450 }
};

// Para uso interno no componente
const busPositions = busPositions4;

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

  const isPositiveFlow = lineResult.p_from_mw >= 0;
  const lineColor = isPositiveFlow ? '#90EE90' : '#FFB6B6';
  const strokeColor = isPositiveFlow ? '#006400' : '#8B0000';
  const arrowColor = isPositiveFlow ? '#006400' : '#8B0000';

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
        stroke="transparent"
        strokeWidth="15"
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => onHover(e, true)}
        onMouseLeave={(e) => onHover(e, false)}
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
          style={{ cursor: 'pointer', pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

// Interface e Props
interface Diagram4BusProps {
  buses: Bus[];
  generators: Generator[];
  branches: Branch[];
  lineResults?: LineResult[];
  isResultView: boolean;
  onBusClick?: (bus: Bus) => void;
  onGeneratorClick?: (gen: Generator) => void;
  onBranchClick?: (branch: Branch) => void;
  onLoadClick?: (bus: Bus) => void;
  onBusHover?: (e: React.MouseEvent, show: boolean, bus?: Bus) => void;
  onGeneratorHover?: (e: React.MouseEvent, show: boolean, gen?: Generator) => void;
  onBranchHover?: (e: React.MouseEvent, show: boolean, branch?: Branch) => void;
  onLoadHover?: (e: React.MouseEvent, show: boolean, bus?: Bus) => void;
  hasDragged?: boolean;
}

const Diagram4Bus: React.FC<Diagram4BusProps> = ({
  buses,
  generators,
  branches,
  lineResults,
  isResultView,
  onBusClick,
  onGeneratorClick,
  onBranchClick,
  onLoadClick,
  onBusHover,
  onGeneratorHover,
  onBranchHover,
  onLoadHover,
  hasDragged
}) => {
  const getBusType = (busId: number): number => {
    const bus = buses.find(b => b.bus_i === busId);
    return bus ? bus.type : 1;
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
      (lr.from_bus === fbus && lr.to_bus === tbus) ||
      (lr.from_bus === tbus && lr.to_bus === fbus)
    );
  };

  // Calcular posições otimizadas dos labels usando useMemo para performance
  const optimalLabelPositions = useMemo(() => {
    const busData = buses.map(bus => {
      const pos = busPositions[bus.bus_i];
      return {
        id: bus.bus_i,
        x: pos?.x || 0,
        y: pos?.y || 0,
        label: `Barra ${bus.bus_i}`,
        hasGenerator: !!getGenerator(bus.bus_i),
        hasLoad: hasLoad(bus.bus_i)
      };
    }).filter(b => b.x !== 0 || b.y !== 0);

    const branchData = branches.map(b => ({
      from: b.fbus,
      to: b.tbus
    }));

    return calculateOptimalLabelPositions(busData, branchData, busPositions);
  }, [buses, branches, generators]);

  // Calcular posições otimizadas dos labels de linhas
  const optimalLineLabelPositions = useMemo(() => {
    const busData = buses.map(bus => {
      const pos = busPositions[bus.bus_i];
      return {
        id: bus.bus_i,
        x: pos?.x || 0,
        y: pos?.y || 0,
        hasGenerator: !!getGenerator(bus.bus_i),
        hasLoad: hasLoad(bus.bus_i)
      };
    }).filter(b => b.x !== 0 || b.y !== 0);

    const branchData = branches.map(b => ({
      from: b.fbus,
      to: b.tbus,
      label: `L${b.fbus}-${b.tbus}`
    }));

    return calculateOptimalLineLabelPositions(branchData, busPositions, busData);
  }, [buses, branches, generators]);

  return (
    <>
      {/* Linhas de transmissão */}
      {branches.map((branch: Branch, index: number) => {
        const pos1 = busPositions[branch.fbus];
        const pos2 = busPositions[branch.tbus];
        if (!pos1 || !pos2) return null;

        const lineKey = `${branch.fbus}-${branch.tbus}`;
        const lineLabelPos = optimalLineLabelPositions.get(lineKey);

        if (isResultView && lineResults) {
          const lineResult = getLineResult(branch.fbus, branch.tbus);
          if (!lineResult) return null;

          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2;
          const isPositiveFlow = lineResult.p_from_mw >= 0;
          const lineColor = isPositiveFlow ? '#90EE90' : '#FFB6B6';
          const strokeColor = isPositiveFlow ? '#006400' : '#8B0000';
          const arrowColor = isPositiveFlow ? '#006400' : '#8B0000';

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const unitX = dx / length;
          const unitY = dy / length;

          const arrows = [];
          const numArrows = 4;
          const arrowSpacing = length / (numArrows + 1);

          for (let i = 1; i <= numArrows; i++) {
            const arrowX = pos1.x + unitX * arrowSpacing * i;
            const arrowY = pos1.y + unitY * arrowSpacing * i;
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
            <g 
              key={index}
              onClick={() => {
                if (!hasDragged && onBranchClick) onBranchClick(branch);
              }}
            >
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
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke="transparent"
                strokeWidth="15"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => onBranchHover && onBranchHover(e, true, branch)}
                onMouseLeave={(e) => onBranchHover && onBranchHover(e, false, undefined)}
              />
              {arrows}
              {lineLabelPos && (
                <text
                  x={lineLabelPos.x}
                  y={lineLabelPos.y}
                  textAnchor="middle"
                  fill="#000"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => onBranchHover && onBranchHover(e, true, branch)}
                  onMouseLeave={(e) => onBranchHover && onBranchHover(e, false, undefined)}
                  onClick={() => {
                    if (!hasDragged && onBranchClick) onBranchClick(branch);
                  }}
                >
                  L{branch.fbus}-{branch.tbus}
                </text>
              )}
            </g>
          );
        } else {
          // Renderização de linha neutra com label posicionado dinamicamente
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const unitX = dx / length;
          const unitY = dy / length;
          
          const arrows = [];
          const numArrows = 4;
          const arrowSpacing = length / (numArrows + 1);
          
          for (let i = 1; i <= numArrows; i++) {
            const arrowX = pos1.x + unitX * arrowSpacing * i;
            const arrowY = pos1.y + unitY * arrowSpacing * i;
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
                fill="#000"
                stroke="#000"
                strokeWidth="1"
              />
            );
          }

          return (
            <g 
              key={index}
              onClick={() => {
                if (!hasDragged && onBranchClick) onBranchClick(branch);
              }}
            >
              <line 
                x1={pos1.x} 
                y1={pos1.y} 
                x2={pos2.x} 
                y2={pos2.y} 
                stroke="transparent" 
                strokeWidth="15"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => onBranchHover && onBranchHover(e, true, branch)}
                onMouseLeave={(e) => onBranchHover && onBranchHover(e, false, undefined)}
              />
              
              <line 
                x1={pos1.x} 
                y1={pos1.y} 
                x2={pos2.x} 
                y2={pos2.y} 
                stroke="#D3D3D3" 
                strokeWidth="9"
                style={{ pointerEvents: 'none' }}
              />
              
              <line 
                x1={pos1.x} 
                y1={pos1.y} 
                x2={pos2.x} 
                y2={pos2.y} 
                stroke="#000" 
                strokeWidth="4"
                style={{ pointerEvents: 'none' }}
              />
              
              {arrows}
              
              {lineLabelPos && (
                <text
                  x={lineLabelPos.x}
                  y={lineLabelPos.y}
                  textAnchor="middle"
                  fill="#000"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => onBranchHover && onBranchHover(e, true, branch)}
                  onMouseLeave={(e) => onBranchHover && onBranchHover(e, false, undefined)}
                  onClick={() => {
                    if (!hasDragged && onBranchClick) onBranchClick(branch);
                  }}
                >
                  L{branch.fbus}-{branch.tbus}
                </text>
              )}
            </g>
          );
        }
      })}

      {/* Barras */}
      {buses.map((bus: Bus) => {
        const pos = busPositions[bus.bus_i];
        if (!pos) return null;

        const BusComponent = bus.type === 3 ? ReferenceBus : NormalBus;
        const labelPos = optimalLabelPositions.get(bus.bus_i);
        
        return (
          <g key={bus.bus_i}>
            {/* Renderizar círculo da barra */}
            <g
              onMouseEnter={(e) => onBusHover && onBusHover(e, true, bus)}
              onMouseLeave={(e) => onBusHover && onBusHover(e, false, undefined)}
              onClick={() => {
                if (!hasDragged && onBusClick) onBusClick(bus);
              }}
              style={{ cursor: 'pointer' }}
            >
              {bus.type === 3 ? (
                <>
                  <circle cx={pos.x} cy={pos.y} r="25" fill="#4169E1" stroke="#000" strokeWidth="3" />
                  <circle cx={pos.x} cy={pos.y} r="12" fill="#000" />
                </>
              ) : (
                <circle cx={pos.x} cy={pos.y} r="25" fill="#4169E1" stroke="#000" strokeWidth="3" />
              )}
            </g>
            
            {/* Renderizar label na posição otimizada */}
            {labelPos && (
              <text 
                x={labelPos.x} 
                y={labelPos.y} 
                textAnchor="middle" 
                fill="#000" 
                fontSize="14" 
                fontWeight="bold"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => onBusHover && onBusHover(e, true, bus)}
                onMouseLeave={(e) => onBusHover && onBusHover(e, false, undefined)}
                onClick={() => {
                  if (!hasDragged && onBusClick) onBusClick(bus);
                }}
              >
                Barra {bus.bus_i}
              </text>
            )}
          </g>
        );
      })}

      {/* Indicadores de Geradores */}
      {buses.map((bus: Bus) => {
        const generator = getGenerator(bus.bus_i);
        if (!generator) return null;

        const pos = busPositions[bus.bus_i];
        if (!pos) return null;

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

      {/* Indicadores de Cargas */}
      {buses.map((bus: Bus) => {
        if (!hasLoad(bus.bus_i)) return null;

        const pos = busPositions[bus.bus_i];
        if (!pos) return null;

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

export default Diagram4Bus;
