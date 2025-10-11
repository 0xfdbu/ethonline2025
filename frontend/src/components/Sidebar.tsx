import React, { useState, useMemo } from 'react';
import type { Node } from '@xyflow/core';
import { Copy, GripVertical, Send, Layers } from 'lucide-react';

interface NodeTemplate extends Node {
  icon?: React.ReactNode;
  description?: string;
  category?: string;
}

const nodeTemplates: NodeTemplate[] = [
  {
    id: 'bridge',
    data: { label: 'Bridge USDC' },
    type: 'default',
    icon: <Send className="w-4 h-4" />,
    description: 'Cross-chain token bridge',
    category: 'Bridge',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { token: 'USDC', amount: 100, fromChainId: 80002, toChainId: 84532 },
  },
  {
    id: 'swap',
    data: { label: 'Swap to ETH' },
    type: 'default',
    icon: <Send className="w-4 h-4" />,
    description: 'Token exchange',
    category: 'DEX',
    style: { background: 'rgba(16, 185, 129, 0.8)', color: 'white', backdropFilter: 'blur(10px)' },
    params: { toToken: 'ETH' },
  }
];

const categories = Array.from(new Set(nodeTemplates.map(t => t.category)));

export const Sidebar: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return nodeTemplates.filter(t =>
      t.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const groupedTemplates = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category] = filteredTemplates.filter(t => t.category === category);
      return acc;
    }, {} as Record<string, NodeTemplate[]>);
  }, [filteredTemplates]);

  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Bridge: 'from-emerald-500/20 to-cyan-500/20 border-emerald-400/30',
      DEX: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30',
      Yield: 'from-blue-500/20 to-purple-500/20 border-blue-400/30',
      Security: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
    };
    return colors[category] || 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      Bridge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      DEX: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      Yield: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      Security: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  };

  return (
    <aside className="w-64 h-screen flex flex-col glass bg-slate-950/40 backdrop-blur-xl border-r border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-950/60 to-slate-900/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold font-mono text-sm bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Node Palette
          </h3>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categories.map((category) => (
          groupedTemplates[category]?.length > 0 && (
            <div key={category}>
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-2 transition-all duration-300 group bg-gradient-to-r ${getCategoryColor(category)} border`}
              >
                <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">{category}</span>
                <span className={`text-xs font-bold transition-transform duration-300 ${expandedCategory === category ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Category Badge */}
              {expandedCategory === category && (
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-mono border ${getCategoryBadgeColor(category)}`}>
                    {groupedTemplates[category].length} node{groupedTemplates[category].length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Nodes */}
              {expandedCategory === category && (
                <div className="space-y-2 ml-2">
                  {groupedTemplates[category].map((template) => (
                    <div
                      key={template.id}
                      onMouseEnter={() => setHoveredNode(template.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      draggable
                      onDragStart={(e) => onDragStart(e, template)}
                      className="relative group cursor-move"
                    >
                      {/* Glow background on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:blur-md`}
                      ></div>

                      {/* Node Card */}
                      <div
                        className={`relative p-3 rounded-lg border transition-all duration-300 backdrop-blur-sm ${
                          hoveredNode === template.id
                            ? 'border-cyan-400/50 bg-white/10 shadow-lg shadow-cyan-500/20'
                            : 'border-white/10 bg-white/5 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5 p-2 rounded-md bg-white/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                            {template.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-semibold text-white truncate">
                              {template.data.label}
                            </p>
                            <p className="font-mono text-xs text-gray-400 truncate">
                              {template.description}
                            </p>
                          </div>

                          {/* Drag Handle */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 group-hover:text-cyan-400">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Drag Indicator */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 rounded-t-lg transition-opacity"></div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 top-0 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <p className="text-xs font-mono text-gray-200">Drag to canvas</p>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-t border-white/20 rotate-45"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ))}

        {filteredTemplates.length === 0 && (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <Copy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-mono text-gray-400">No nodes found</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-slate-950/60 to-slate-900/40">
        <p className="text-xs font-mono text-gray-500 text-center">
          Tip: Drag nodes to canvas
        </p>
      </div>

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