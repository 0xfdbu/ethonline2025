// components/IntentVisualizer.tsx

import React from 'react';
import type { Node, Edge } from '@xyflow/core';
import { Composer } from './Composer';
import { Sidebar } from './Sidebar';

interface IntentVisualizerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodesAdd: (newNode: Node) => void;
}

export const IntentVisualizer: React.FC<IntentVisualizerProps> = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodesAdd,
}) => {
  return (
    <div className="flex h-[800px]">
      {/* Sidebar */}
      <div className="w-96 ">
        <Sidebar />
      </div>
      {/* Composer */}
      <div className="flex-1">
        <Composer
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesAdd={onNodesAdd}
        />
      </div>
    </div>
  );
};