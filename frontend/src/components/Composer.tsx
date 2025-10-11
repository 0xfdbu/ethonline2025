import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
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

      const templateData = event.dataTransfer.getData('application/reactflow');
      const template = JSON.parse(templateData) as Node;  // Parse full template
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${template.id}-${+new Date()}`,  // Unique ID
        type: template.type || 'default',
        position,
        data: { label: template.data.label },  // Use template label
        style: template.style,
        // Store params for step mapping (used in hook)
        params: template.params || {},
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlow, setNodes],
  );

  return (
    <div 
      ref={reactFlowWrapper}
      className="w-full h-[70vh] lg:h-[80vh] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 relative"
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