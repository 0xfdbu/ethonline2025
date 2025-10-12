// frontend/src/components/Sidebar.tsx

import React, { useState } from 'react';
import type { Node } from '@xyflow/core';
import { Send, Repeat2, Plus, X, Layers } from 'lucide-react';

interface NodeTemplate extends Node {
  icon?: React.ReactNode;
  description?: string;
  category?: string;
}

const defaultNodeTemplates: NodeTemplate[] = [
  {
    id: 'bridge',
    data: { label: 'Bridge USDC' },
    type: 'bridge',
    icon: <Send className="w-4 h-4" />,
    description: 'Cross-chain token bridge',
    category: 'Bridge',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 },
  },
  {
    id: 'swap',
    data: { label: 'Swap to ETH' },
    type: 'swap',
    icon: <Repeat2 className="w-4 h-4" />,
    description: 'Token exchange',
    category: 'DEX',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { toToken: 'ETH' },
  }
];

export const Sidebar: React.FC = () => {
  const [templates, setTemplates] = useState<NodeTemplate[]>(defaultNodeTemplates);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeDescription, setNewNodeDescription] = useState('');

  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateNode = () => {
    if (!newNodeLabel.trim()) return;

    const newTemplate: NodeTemplate = {
      id: `custom-${Date.now()}`,
      data: { label: newNodeLabel },
      type: 'default',
      icon: <Plus className="w-4 h-4" />,
      description: newNodeDescription || 'Custom node',
      category: 'Custom',
      style: {
        background: 'rgba(139, 92, 246, 0.8)',
        color: 'white',
        backdropFilter: 'blur(10px)',
      },
      params: {},
    };

    setTemplates([...templates, newTemplate]);
    setNewNodeLabel('');
    setNewNodeDescription('');
    setShowCreateModal(false);
  };

  const handleDeleteNode = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <aside className="w-full h-screen flex flex-col fixed left-0 top-0 z-10 overflow-hidden md:relative md:z-auto">

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            draggable
            onDragStart={(e) => onDragStart(e, template)}
            className="group relative cursor-grab active:cursor-grabbing"
          >
            {/* Glow background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:blur-md"></div>

            {/* Node Card */}
            <div className="relative p-3 rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5 p-2 rounded-md bg-white/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                  {template.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex-grow">
                  <p className="font-mono text-sm font-semibold text-white truncate">
                    {template.data.label}
                  </p>
                  <p className="font-mono text-xs text-gray-400 truncate">
                    {template.description}
                  </p>
                </div>

                {/* Delete Button - only for custom nodes */}
                {template.category === 'Custom' && (
                  <button
                    onClick={() => handleDeleteNode(template.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Drag Indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 rounded-t-lg transition-opacity"></div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-mono text-gray-400">No nodes available</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Node Button */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-slate-950/60 to-slate-900/40 sticky bottom-0">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:border-purple-400/60 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 hover:text-purple-200 font-mono text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Custom Node
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-mono text-cyan-300">Create Custom Node</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Label Input */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Node Label</label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g., Stake Tokens"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newNodeDescription}
                  onChange={(e) => setNewNodeDescription(e.target.value)}
                  placeholder="What does this node do?"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNode}
                disabled={!newNodeLabel.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 text-white font-mono text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs font-mono text-gray-400 text-center">
              Drag custom nodes to the canvas
            </p>
          </div>
        </div>
      )}

      <style>{`
        /* Scrollbar styling */
        aside::-webkit-scrollbar {
          width: 6px;
        }

        aside::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        aside::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
          transition: background 0.3s;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </aside>
  );
};