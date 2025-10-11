import React from 'react';
import type { Node } from '@xyflow/core';

const nodeTemplates: Node[] = [
  {
    id: 'bridge',
    data: { label: 'Bridge USDC' },
    type: 'default',
    style: { background: '#10b981', color: 'white' },
    params: { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 },  // Pre-set params
  },
  {
    id: 'swap',
    data: { label: 'Swap to ETH' },
    type: 'default',
    style: { background: '#10b981', color: 'white' },
    params: { toToken: 'ETH' },
  },
];

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, template: Node) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));  // Serialize full template
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="lg:w-64 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md h-screen lg:h-auto overflow-y-auto fixed lg:static z-50 lg:z-auto lg:translate-x-0 transform lg:transform-none w-64">
      <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Node Palette</h3>
      <ul className="space-y-2">
        {nodeTemplates.map((template) => (
          <li key={template.id}>
            <div
              draggable
              onDragStart={(e) => onDragStart(e, template)}
              className="p-3 bg-white dark:bg-gray-800 rounded cursor-move shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-sm">{template.data.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};