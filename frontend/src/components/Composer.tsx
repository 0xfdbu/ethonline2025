// components/Composer.tsx

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/core';

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
  onConnect: onConnectProp, // Renamed to avoid conflict
  onNodesAdd,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnectInternal = useCallback((connection: Connection) => {
    // Add the edge internally using React Flow's addEdge helper
    setEdges((eds) => addEdge(connection, eds));
    // Optionally notify parent
    onConnectProp(connection);
  }, [setEdges, onConnectProp]);

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
      const template = JSON.parse(templateData) as Node;
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${template.id}-${+new Date()}`,
        type: template.type || 'default',
        position,
        data: { label: template.data.label },
        style: { 
          ...template.style,
          boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
          transition: 'box-shadow 0.3s ease',
        },
        params: template.params || {},
      };

      setNodes((nds) => nds.concat(newNode));
      // Optionally notify parent
      onNodesAdd(newNode);
    },
    [reactFlow, setNodes, onNodesAdd],
  );

  return (
    <div 
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '700px' }}
      className="glass rounded-lg overflow-hidden shadow-2xl relative border border-neon-cyan/20"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnectInternal}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        className="w-full h-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 dark:from-gray-900/70 dark:to-gray-800/70"
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} color="#00f5ff" />
      </ReactFlow>
    </div>
  );
};