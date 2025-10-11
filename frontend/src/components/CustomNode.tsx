// src/components/CustomNode.tsx (New: Custom Node Component)
import React from 'react';
import type { NodeProps } from '@xyflow/react';

export const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="glass rounded-lg p-3 shadow-glow border border-neon-cyan/30 w-32 h-16 flex items-center justify-center animate-glow">
      <div className="font-mono text-sm text-neon-cyan text-center">
        {data.label}
        {data.params && (
          <div className="text-xs text-gray-300 mt-1 opacity-80">
            {Object.entries(data.params).map(([key, value]) => `${key}: ${value}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};