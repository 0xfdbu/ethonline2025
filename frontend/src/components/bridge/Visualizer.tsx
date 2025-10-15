import React, { useCallback, useMemo } from 'react';
import { DollarSign, Zap, Shield, Link, TrendingUp } from 'lucide-react'; // Replaced Bridge with Link
import type { Source, VisualizerProps } from './types'; // Adjust import path as needed

const formatAmount = (amount: string) => {
  // Placeholder for formatting; implement as needed
  return amount;
};

export const Visualizer: React.FC<VisualizerProps> = ({
  quote,
  fromToken,
  selectedSources,
  onSourcesToggle,
  toNetwork,
  toToken,
  fees
}) => {
  const handleToggle = useCallback((chainId: number) => {
    onSourcesToggle(chainId);
  }, [onSourcesToggle]);

  const effectiveSelected = useMemo(() => {
    if (selectedSources.length === 0 && quote.sources) {
      return quote.sources.map((s: Source) => s.chainID);
    }
    return selectedSources;
  }, [selectedSources, quote.sources]);

  const feePositions = useMemo(() => [
    { x: 150, y: 220, label: 'Protocol', amount: fees.protocol, color: '#10B981', icon: DollarSign },
    { x: 290, y: 220, label: 'Solver', amount: fees.solver, color: '#3B82F6', icon: Zap },
    { x: 220, y: 280, label: 'CA Gas', amount: fees.caGas, color: '#8B5CF6', icon: Shield },
  ], [fees]);

  const sourceX = 50;
  const sourceYBase = 30;
  const sourceSpacing = 140;
  const bridgeX = 220;
  const bridgeY = 150;
  const destX = 390;
  const destY = 150;
  const totalFeesX = 220;
  const totalFeesY = 340;

  const Node: React.FC<{ 
    x: number; 
    y: number; 
    size: number; 
    logo?: string; 
    name: string; 
    amount?: string; 
    isSelected?: boolean; 
    onClick?: () => void;
    color?: string;
    isBridge?: boolean;
    isDestination?: boolean;
    icon?: React.ElementType;
  }> = ({ x, y, size, logo, name, amount, isSelected = false, onClick, color = '#10B981', isBridge = false, isDestination = false, icon: Icon }) => (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Outer glow ring for selected or special nodes */}
      {(isSelected || isBridge || isDestination) && (
        <>
          <circle
            cx={x}
            cy={y}
            r={size / 2 + 8}
            fill="none"
            stroke={isSelected ? '#3B82F6' : isBridge ? '#F59E0B' : '#10B981'}
            strokeWidth="1.5"
            opacity="0.3"
          >
            <animate attributeName="r" from={size / 2 + 8} to={size / 2 + 12} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0.1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={x}
            cy={y}
            r={size / 2 + 5}
            fill="none"
            stroke={isSelected ? '#3B82F6' : isBridge ? '#F59E0B' : '#10B981'}
            strokeWidth="2"
            opacity="0.5"
          />
        </>
      )}
      
      {/* Main node circle with gradient */}
      <circle
        cx={x}
        cy={y}
        r={size / 2}
        fill={`url(#gradient-${x}-${y})`}
        stroke={isSelected ? '#3B82F6' : '#E5E7EB'}
        strokeWidth="3"
        filter="url(#shadow)"
      />
      
      {/* Inner highlight */}
      <circle
        cx={x - size / 8}
        cy={y - size / 8}
        r={size / 6}
        fill="white"
        opacity="0.3"
      />
      
      <defs>
        <radialGradient id={`gradient-${x}-${y}`} cx="30%" cy="30%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.7 }} />
        </radialGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Logo or icon in node */}
      {logo ? (
        <foreignObject x={x - size / 2 + 4} y={y - size / 2 + 4} width={size - 8} height={size - 8}>
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20">
            <img src={logo} alt={name} className="w-4/5 h-4/5 object-cover rounded-full" />
          </div>
        </foreignObject>
      ) : Icon ? (
        <foreignObject x={x - size / 2} y={y - size / 2} width={size} height={size}>
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={size * 0.5} color="white" strokeWidth={2.5} />
          </div>
        </foreignObject>
      ) : (
        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
          {name.charAt(0)}
        </text>
      )}
      
      {/* Amount badge */}
      {amount && (
        <g>
          <rect
            x={x - 30}
            y={y + size / 2 + 8}
            width="60"
            height="18"
            rx="9"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={color}
            strokeWidth="1.5"
          />
          <text x={x} y={y + size / 2 + 20} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
            {formatAmount(amount)}
          </text>
        </g>
      )}
      
      {/* Name label */}
      <text x={x} y={y + size / 2 + (amount ? 35 : 22)} textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="500">
        {name}
      </text>
    </g>
  );

  const AnimatedPath: React.FC<{ fromX: number; fromY: number; toX: number; toY: number; color?: string; isActive?: boolean }> = ({ 
    fromX, fromY, toX, toY, color = '#475569', isActive = false 
  }) => {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const path = `M ${fromX} ${fromY} Q ${midX} ${midY - 20} ${toX} ${toY}`;
    
    return (
      <g>
        {/* Glow effect for active paths */}
        {isActive && (
          <path 
            d={path} 
            stroke={color} 
            strokeWidth="6" 
            fill="none" 
            opacity="0.3"
            filter="url(#glow)"
          />
        )}
        {/* Main path */}
        <path 
          d={path} 
          stroke={isActive ? color : '#475569'} 
          strokeWidth="2.5" 
          fill="none" 
          markerEnd="url(#arrowhead)"
          strokeDasharray={isActive ? "0" : "5,5"}
          opacity={isActive ? "1" : "0.4"}
        >
          {isActive && (
            <animate 
              attributeName="stroke-dashoffset" 
              from="0" 
              to="1000" 
              dur="20s" 
              repeatCount="indefinite" 
            />
          )}
        </path>
        
        {/* Animated dots flowing along path */}
        {isActive && (
          <>
            <circle r="3" fill={color}>
              <animateMotion dur="3s" repeatCount="indefinite" path={path} />
            </circle>
            <circle r="3" fill={color} opacity="0.6">
              <animateMotion dur="3s" repeatCount="indefinite" path={path} begin="1s" />
            </circle>
          </>
        )}
        
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </g>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-6 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link className="text-cyan-400" size={24} strokeWidth={2.5} /> {/* Replaced Bridge with Link */}
          <h3 className="text-lg font-bold text-white">Bridge Flow Visualization</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/30">
          <TrendingUp size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300">Live</span>
        </div>
      </div>

      {/* SVG Container for Flow Diagram */}
      <div className="w-full h-96 relative">
        <svg viewBox="0 0 450 380" className="w-full h-full">
          {/* Definitions */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#3B82F6" />
            </marker>
          </defs>

          {/* Sources Nodes */}
          {quote.allSources?.map((source: Source, i: number) => {
            const x = sourceX;
            const y = sourceYBase + i * sourceSpacing;
            const chainId = source.chainID;
            const isSelected = effectiveSelected.includes(chainId);
            return (
              <g key={i}>
                <Node
                  x={x}
                  y={y}
                  size={48}
                  logo={source.chainLogo}
                  name={source.chainName}
                  amount={source.amount}
                  isSelected={isSelected}
                  onClick={() => handleToggle(chainId)}
                  color={isSelected ? '#10B981' : '#64748B'}
                />
                {/* Arrow from source to bridge */}
                {isSelected && (
                  <AnimatedPath 
                    fromX={x} 
                    fromY={y + 24} 
                    toX={bridgeX - 30} 
                    toY={bridgeY} 
                    color="#10B981" 
                    isActive={true}
                  />
                )}
              </g>
            );
          })}

          {/* Bridge Central Node */}
          <Node x={bridgeX} y={bridgeY} size={64} icon={Link} name="Bridge Hub" color="#F59E0B" isBridge={true} /> {/* Replaced Bridge with Link */}

          {/* Fees nodes */}
          {feePositions.map((fee, i) => (
            <g key={i}>
              <Node 
                x={fee.x} 
                y={fee.y} 
                size={32} 
                name={fee.label} 
                amount={fee.amount} 
                color={fee.color}
                icon={fee.icon}
              />
              <AnimatedPath 
                fromX={bridgeX} 
                fromY={bridgeY + 32} 
                toX={fee.x} 
                toY={fee.y - 16} 
                color={fee.color} 
                isActive={false}
              />
            </g>
          ))}

          {/* Total Fees Node */}
          <Node x={totalFeesX} y={totalFeesY} size={36} icon={DollarSign} name="Total Fees" amount={fees.total} color="#EF4444" />

          {/* Arrow to Destination */}
          <AnimatedPath 
            fromX={totalFeesX} 
            fromY={totalFeesY + 18} 
            toX={destX} 
            toY={destY} 
            color="#10B981" 
            isActive={true}
          />

          {/* Destination Node */}
          <Node 
            x={destX} 
            y={destY} 
            size={56} 
            logo={toNetwork.logo} 
            name={`${toNetwork.name} • ${toToken.symbol}`} 
            amount={quote.output} 
            color="#059669"
            isDestination={true}
          />
        </svg>
      </div>

      {/* Stats Footer */}
      <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-400">Sources</span>
          </div>
          <p className="text-lg font-bold text-white">{effectiveSelected.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-400">Total Fees</span>
          </div>
          <p className="text-lg font-bold text-white">{formatAmount(fees.total)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-slate-400">You Receive</span>
          </div>
          <p className="text-lg font-bold text-white">{formatAmount(quote.output)}</p>
        </div>
      </div>
    </div>
  );
};