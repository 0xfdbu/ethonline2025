import React from 'react';
import type { Node } from '@xyflow/core';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: Node) => void;
}

const nodeTemplates: Node[] = [
  {
    id: 'bridge-template',
    data: { label: 'Bridge USDC' },
    type: 'default',
    style: { background: '#10b981', color: 'white' },
  },
  {
    id: 'swap-template',
    data: { label: 'Swap to ETH' },
    type: 'default',
    style: { background: '#10b981', color: 'white' },
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => (
  <aside className="w-full lg:w-64 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md lg:mr-4 h-screen lg:h-auto overflow-y-auto fixed lg:static z-50 lg:z-auto lg:translate-x-0 transform lg:transform-none">
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