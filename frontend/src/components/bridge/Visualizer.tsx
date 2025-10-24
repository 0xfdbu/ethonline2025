import React, { useCallback, useMemo } from 'react';
import { DollarSign, Zap, Shield, Link, TrendingUp, ArrowRight, Play } from 'lucide-react';

interface Source {
  amount: string;
  chainID: number;
  chainLogo: string;
  chainName: string;
  contractAddress: string;
}

interface Quote {
  input: string;
  output: string;
  gasFee: string;
  bridgeFee: string;
  slippage: string;
  sources?: Source[];
  allSources?: Source[];
}

interface Network {
  id: string;
  name: string;
  logo: string;
}

interface Token {
  symbol: string;
}

interface Fees {
  caGas: string;
  gasSupplied: string;
  protocol: string;
  solver: string;
  total: string;
}

interface VisualizerProps {
  quote: Quote;
  fromToken: Token;
  selectedSources: number[];
  onSourcesToggle: (chainId: number) => void;
  onSimulate?: () => void;
  toNetwork: Network;
  toToken: Token;
  fees: Fees;
  isSimulating?: boolean;
}

const formatAmount = (amountStr: string): string => {
  const num = parseFloat(amountStr || '0');
  if (num === 0) return '0';
  if (num < 0.000001) return num.toExponential(2);
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const Visualizer: React.FC<VisualizerProps> = ({
  quote,
  fromToken,
  selectedSources,
  onSourcesToggle,
  onSimulate,
  toNetwork,
  toToken,
  fees,
  isSimulating = false
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
    isFee?: boolean;
    icon?: React.ElementType;
  }> = ({ x, y, size, logo, name, amount, isSelected = false, onClick, color = '#10B981', isBridge = false, isDestination = false, isFee = false, icon: Icon }) => (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Pulsing rings for active nodes */}
      {(isSelected || isBridge || isDestination) && (
        <>
          <circle
            cx={x}
            cy={y}
            r={size / 2 + 10}
            fill="none"
            stroke={isSelected ? '#10B981' : isBridge ? '#F59E0B' : '#10B981'}
            strokeWidth="2"
            opacity="0.4"
          >
            <animate attributeName="r" from={size / 2 + 10} to={size / 2 + 16} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={x}
            cy={y}
            r={size / 2 + 6}
            fill="none"
            stroke={isSelected ? '#10B981' : isBridge ? '#F59E0B' : '#10B981'}
            strokeWidth="2"
            opacity="0.6"
          />
        </>
      )}
      
      {/* Main node with gradient and shadow */}
      <defs>
        <radialGradient id={`gradient-${x}-${y}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
        <filter id={`shadow-${x}-${y}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.4" />
        </filter>
      </defs>
      
      <circle
        cx={x}
        cy={y}
        r={size / 2}
        fill={`url(#gradient-${x}-${y})`}
        stroke={isSelected ? '#3B82F6' : isFee ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)'}
        strokeWidth={isSelected ? "3" : "2"}
        filter={`url(#shadow-${x}-${y})`}
      />
      
      {/* Highlight effect */}
      <circle
        cx={x - size / 6}
        cy={y - size / 6}
        r={size / 5}
        fill="black"
        opacity="0.25"
      />
      
      {/* Content */}
      {logo ? (
        <foreignObject x={x - size / 2 + 6} y={y - size / 2 + 6} width={size - 12} height={size - 12}>
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black/20">
            <img src={logo} alt={name} className="w-3/4 h-3/4 object-contain" />
          </div>
        </foreignObject>
      ) : Icon ? (
        <foreignObject x={x - size / 2} y={y - size / 2} width={size} height={size}>
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={size * 0.45} color="black" strokeWidth={2.5} />
          </div>
        </foreignObject>
      ) : (
        <text x={x} y={y + 5} textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">
          {name.charAt(0)}
        </text>
      )}
      
      {/* Amount badge */}
      {amount && (
        <g>
          <rect
            x={x - 35}
            y={y + size / 2 + 10}
            width="70"
            height="20"
            rx="10"
            fill="rgba(255, 255, 255, 0.95)"
            stroke={color}
            strokeWidth="2"
          />
          <text x={x} y={y + size / 2 + 23} textAnchor="middle" fill="black" fontSize="10" fontWeight="700">
            {formatAmount(amount)}
          </text>
        </g>
      )}
      
      {/* Name label */}
      <text 
        x={x} 
        y={y + size / 2 + (amount ? 42 : 28)} 
        textAnchor="middle" 
        fill="#374151" 
        fontSize="11" 
        fontWeight="600"
      >
        {name.length > 12 ? name.substring(0, 12) + '...' : name}
      </text>
    </g>
  );

  const AnimatedPath: React.FC<{ 
    fromX: number; 
    fromY: number; 
    toX: number; 
    toY: number; 
    color?: string; 
    isActive?: boolean;
    isFeeConnection?: boolean;
  }> = ({ fromX, fromY, toX, toY, color = '#475569', isActive = false, isFeeConnection = false }) => {
    // Better curve calculation
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let path;
    if (isFeeConnection) {
      // Gentler curves for fee connections
      const controlOffset = distance * 0.3;
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 + controlOffset;
      path = `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
    } else {
      // Smooth curves for main flow
      const controlPoint1X = fromX + dx * 0.5;
      const controlPoint1Y = fromY;
      const controlPoint2X = fromX + dx * 0.5;
      const controlPoint2Y = toY;
      path = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`;
    }
    
    return (
      <g>
        <defs>
          <filter id="path-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id={`arrow-${color}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={isActive ? color : '#64748B'} />
          </marker>
        </defs>
        
        {/* Glow layer */}
        {isActive && (
          <path 
            d={path} 
            stroke={color} 
            strokeWidth="8" 
            fill="none" 
            opacity="0.25"
            filter="url(#path-glow)"
          />
        )}
        
        {/* Main path */}
        <path 
          d={path} 
          stroke={isActive ? color : '#64748B'} 
          strokeWidth="3" 
          fill="none" 
          markerEnd={`url(#arrow-${color})`}
          strokeDasharray={isActive ? "0" : "6,6"}
          opacity={isActive ? "1" : "0.3"}
        />
        
        {/* Animated particles */}
        {isActive && (
          <>
            <circle r="4" fill={color} opacity="0.8">
              <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
            </circle>
            <circle r="3" fill="black" opacity="0.6">
              <animateMotion dur="2.5s" repeatCount="indefinite" path={path} begin="0.8s" />
            </circle>
            <circle r="4" fill={color} opacity="0.8">
              <animateMotion dur="2.5s" repeatCount="indefinite" path={path} begin="1.6s" />
            </circle>
          </>
        )}
      </g>
    );
  };

  // Calculate positions for better layout
  const sourceCount = quote.allSources?.length || 0;
  const sourceStartY = 100;
  const sourceSpacing = Math.min(100, 300 / Math.max(sourceCount - 1, 1));
  
  return (
    <div className="relative">
      {/* Simulate Button - Positioned absolutely to ensure clickability */}
      {onSimulate && (
        <div className="absolute top-0 right-0 z-20 p-4 pt-2">
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isSimulating
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Play size={16} />
            {isSimulating ? 'Simulating...' : 'Simulate'}
          </button>
        </div>
      )}
      
      <div className="p-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, cyan 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }}></div>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

        {/* Main SVG */}
        <div className="w-full relative" style={{ height: '480px' }}>
          <svg viewBox="0 0 1000 480" className="w-full h-full">
            {/* Source chains (left side) */}
            {quote.allSources?.map((source: Source, i: number) => {
              const x = 100;
              const y = sourceStartY + i * sourceSpacing;
              const chainId = source.chainID;
              const isSelected = effectiveSelected.includes(chainId);
              
              return (
                <g key={chainId}>
                  <Node
                    x={x}
                    y={y}
                    size={60}
                    logo={source.chainLogo}
                    name={source.chainName}
                    amount={source.amount}
                    isSelected={isSelected}
                    onClick={() => handleToggle(chainId)}
                    color={isSelected ? '#10B981' : '#475569'}
                  />
                  
                  {isSelected && (
                    <AnimatedPath 
                      fromX={x + 30} 
                      fromY={y} 
                      toX={350} 
                      toY={240} 
                      color="#10B981" 
                      isActive={true}
                    />
                  )}
                </g>
              );
            })}

            {/* Bridge Hub (center) */}
            <Node 
              x={400} 
              y={240} 
              size={80} 
              icon={Link} 
              name="Nexus" 
              amount={quote.input}
              color="#F59E0B" 
              isBridge={true}
            />

            {/* Fee nodes (below bridge) */}
            <g>
              <Node 
                x={300} 
                y={350} 
                size={48} 
                name="Protocol" 
                amount={fees.protocol} 
                color="#10B981"
                icon={DollarSign}
                isFee={true}
              />
              <AnimatedPath 
                fromX={375} 
                fromY={275} 
                toX={318} 
                toY={328} 
                color="#10B981" 
                isActive={false}
                isFeeConnection={true}
              />
              
              <Node 
                x={400} 
                y={370} 
                size={48} 
                name="Solver" 
                amount={fees.solver} 
                color="#3B82F6"
                icon={Zap}
                isFee={true}
              />
              <AnimatedPath 
                fromX={400} 
                fromY={280} 
                toX={400} 
                toY={346} 
                color="#3B82F6" 
                isActive={false}
                isFeeConnection={true}
              />
              
              <Node 
                x={500} 
                y={350} 
                size={48} 
                name="CA Gas" 
                amount={fees.caGas} 
                color="#8B5CF6"
                icon={Shield}
                isFee={true}
              />
              <AnimatedPath 
                fromX={425} 
                fromY={275} 
                toX={482} 
                toY={328} 
                color="#8B5CF6" 
                isActive={false}
                isFeeConnection={true}
              />
            </g>

            {/* Total fees indicator */}
            <g>
              <rect
                x={340}
                y={440}
                width={120}
                height={32}
                rx="16"
                fill="rgba(239, 68, 68, 0.15)"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <foreignObject x={340} y={440} width={120} height={32}>
                <div className="w-full h-full flex items-center justify-center gap-2">
                  <DollarSign size={14} color="#EF4444" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-red-600">
                    {formatAmount(fees.total)}
                  </span>
                </div>
              </foreignObject>
            </g>

            {/* Main flow to destination */}
            <AnimatedPath 
              fromX={480} 
              fromY={240} 
              toX={850} 
              toY={240} 
              color="#059669" 
              isActive={true}
            />

            {/* Destination (right side) */}
            <Node 
              x={900} 
              y={240} 
              size={70} 
              logo={toNetwork.logo} 
              name={`${toNetwork.name} • ${toToken.symbol}`} 
              amount={quote.output} 
              color="#059669"
              isDestination={true}
            />
          </svg>
        </div>

        {/* Stats Footer */}
        <div className="relative z-10 grid grid-cols-4 gap-4 pt-6 border-t border-black/10 mt-6">
          <div className="bg-white/10 rounded-2xl p-4 border border-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Active Sources</span>
            </div>
            <p className="text-2xl font-bold text-black">{effectiveSelected.length}</p>
            <p className="text-xs text-gray-500 mt-1">of {quote.allSources?.length || 0} chains</p>
          </div>
          
          <div className="bg-white/10 rounded-2xl p-4 border border-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={12} className="text-emerald-600" />
              <span className="text-xs text-gray-600 font-medium">Protocol Fee</span>
            </div>
            <p className="text-2xl font-bold text-black">{formatAmount(fees.protocol)}</p>
          </div>
          
          <div className="bg-white/10 rounded-2xl p-4 border border-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 font-medium">Total Fees</span>
            </div>
            <p className="text-2xl font-bold text-black">{formatAmount(fees.total)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl p-4 border border-emerald-500/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight size={12} className="text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">You Receive</span>
            </div>
            <p className="text-2xl font-bold text-black">{formatAmount(quote.output)}</p>
            <p className="text-xs text-emerald-700 mt-1">{toToken.symbol}</p>
          </div>
        </div>
      </div>
    </div>
  );
};