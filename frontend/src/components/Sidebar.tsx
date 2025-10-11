import React from 'react';
import type { Node } from '@xyflow/core';

const nodeTemplates: Node[] = [
  {
    id: 'bridge',
    data: { label: 'Bridge USDC' },
    type: 'default',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 },
  },
  {
    id: 'swap',
    data: { label: 'Swap to ETH' },
    type: 'default',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { toToken: 'ETH' },
  },
];

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, template: Node) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 h-full p-4 glass rounded-lg shadow-lg overflow-y-auto border-r border-white/10 animate-glow">
      <h3 className="font-semibold mb-4 text-neon-cyan font-mono">Node Palette</h3>
      <ul className="space-y-2">
        {nodeTemplates.map((template) => (
          <li key={template.id}>
            <div
              draggable
              onDragStart={(e) => onDragStart(e, template)}
              className="p-3 rounded cursor-move shadow-sm hover:shadow-glow transition-all duration-200 border border-white/20 hover:border-neon-cyan/50 animate-glow"
              style={template.style}
            >
              <span className="font-mono text-sm">{template.data.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};