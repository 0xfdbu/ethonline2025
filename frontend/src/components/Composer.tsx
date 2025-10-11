import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/core';

interface ComposerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${type}-${+new Date()}`,
        type,
        position,
        data: { label: `${type} Node` },
        style: { background: '#10b981', color: 'white' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlow, setNodes],
  );

  return (
    <div 
      ref={reactFlowWrapper}
      className="w-full h-[70vh] lg:h-[80vh] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900"
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};