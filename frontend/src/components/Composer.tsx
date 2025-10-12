// frontend/src/components/Composer.tsx

import React, { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Handle,
  Position,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/core';
import { Send, Repeat2, Zap } from 'lucide-react';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Custom Node Components (unchanged)
const BridgeNode = ({ data, selected }: any) => (
  <div
    className={`px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 ${
      selected ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/50' : 'hover:ring-1 hover:ring-cyan-400/50'
    }`}
    style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.15) 100%)',
      border: selected ? '2px solid rgba(6, 182, 212, 1)' : '2px solid rgba(6, 182, 212, 0.5)',
      boxShadow: selected ? '0 0 20px rgba(6, 182, 212, 0.4)' : 'none',
      minWidth: '160px',
    }}
  >
    <Handle type="target" position={Position.Left} />
    
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-md flex-shrink-0">
        <Send className="w-3 h-3 text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="font-mono font-bold text-xs text-white truncate">{data.label}</p>
        <p className="font-mono text-xs text-gray-300 truncate">Bridge</p>
      </div>
    </div>

    <Handle type="source" position={Position.Right} />
  </div>
);

const SwapNode = ({ data, selected }: any) => (
  <div
    className={`px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 ${
      selected ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/50' : 'hover:ring-1 hover:ring-cyan-400/50'
    }`}
    style={{
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(59, 130, 246, 0.15) 100%)',
      border: selected ? '2px solid rgba(6, 182, 212, 1)' : '2px solid rgba(6, 182, 212, 0.5)',
      boxShadow: selected ? '0 0 20px rgba(6, 182, 212, 0.4)' : 'none',
      minWidth: '160px',
    }}
  >
    <Handle type="target" position={Position.Left} />
    
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex-shrink-0">
        <Repeat2 className="w-3 h-3 text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="font-mono font-bold text-xs text-white truncate">{data.label}</p>
        <p className="font-mono text-xs text-gray-300 truncate">Swap</p>
      </div>
    </div>

    <Handle type="source" position={Position.Right} />
  </div>
);

const StartNode = ({ data, selected }: any) => (
  <div
    className={`px-4 py-2.5 rounded-lg backdrop-blur-md transition-all duration-300 ${
      selected ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/50' : 'hover:ring-1 hover:ring-cyan-400/50'
    }`}
    style={{
      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.4) 0%, rgba(6, 182, 212, 0.25) 100%)',
      border: selected ? '2px solid rgba(6, 182, 212, 1)' : '2px solid rgba(6, 182, 212, 0.6)',
      boxShadow: selected ? '0 0 25px rgba(6, 182, 212, 0.5)' : '0 0 15px rgba(6, 182, 212, 0.25)',
      minWidth: '180px',
    }}
  >
    <div className="flex items-center gap-2">
      <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-md flex-shrink-0">
        <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="font-mono font-bold text-sm text-white">{data.label}</p>
        <p className="font-mono text-xs text-cyan-300">Intent</p>
      </div>
    </div>

    <Handle type="source" position={Position.Right} />
  </div>
);

// Custom edge component (unchanged)
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: any) => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
      width="100%"
      height="100%"
      viewBox="0 0 100% 100%"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.9)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.9)" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={`url(#gradient-${id})`}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        filter={`url(#glow-${id})`}
        className="transition-all duration-300"
        strokeDasharray="5,5"
        style={{
          animation: 'dashflow 20s linear infinite',
        }}
      />
    </svg>
  );
};

interface ComposerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodesAdd: (newNode: Node) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect: onConnectProp,
  onNodesAdd,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(
    () => ({
      bridge: BridgeNode,
      swap: SwapNode,
      start: StartNode,
      input: StartNode,
      default: ({ data, selected }: any) => <StartNode data={data} selected={selected} />,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const onConnectInternal = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'custom',
            animated: true,
          },
          eds
        )
      );
      onConnectProp(connection);
    },
    [setEdges, onConnectProp]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const templateData = event.dataTransfer.getData('application/reactflow');
      if (!templateData) return; // No template, ignore

      const template = JSON.parse(templateData) as Node;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${template.id}-${+new Date()}`,
        type: template.type as any,
        position,
        data: { ...template.data },
        params: template.params || {},
      };

      setNodes((nds) => nds.concat(newNode));
      onNodesAdd(newNode);

      // Fit view to include the new node
      requestAnimationFrame(() => {
        reactFlow.fitView({ padding: 0.2, includeHiddenNodes: false });
      });
    },
    [reactFlow, setNodes, onNodesAdd]
  );

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%' }} // Full height, no marginLeft - handled by parent flex
      className="relative rounded-2xl overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnectInternal}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        className="w-full h-full"
        style={{
          background: 'transparent',
        }}
      >
        <Background
          variant="dots"
          gap={16}
          size={1}
          color="rgba(6, 182, 212, 0.2)"
          style={{ opacity: 0.5 }}
        />
        <Controls
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
          className="!bg-slate-950/80 !border-cyan-500/20"
        />
      </ReactFlow>
    </div>
  );
};