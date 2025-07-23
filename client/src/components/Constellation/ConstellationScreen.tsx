import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { StorageService } from '../../services/storageService';
import { RarityCalculator } from '../../utils/rarityCalculator';
import type { ConstellationNode } from '../../types';

export function ConstellationScreen() {
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [stats, setStats] = useState(() => StorageService.getStats());
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConstellation();
  }, []);

  useEffect(() => {
    drawConstellation();
  }, [nodes, scale, offset]);

  const loadConstellation = () => {
    const constellation = StorageService.getConstellation();
    setNodes(constellation);
    setStats(StorageService.getStats());
  };

  const drawConstellation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw connections first
    drawConnections(ctx);
    
    // Draw nodes
    drawNodes(ctx);

    ctx.restore();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'var(--terminal-green)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.stroke();
        }
      });
    });

    ctx.setLineDash([]);
  };

  const drawNodes = (ctx: CanvasRenderingContext2D) => {
    nodes.forEach(node => {
      const radius = 8 + (node.difficulty * 3); // Size based on difficulty
      const borderWidth = getRarityBorderWidth(node.rarity);
      
      // Draw node background
      ctx.fillStyle = 'var(--terminal-bg)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border with rarity color
      ctx.strokeStyle = RarityCalculator.getRarityColor(node.rarity);
      ctx.lineWidth = borderWidth;
      ctx.stroke();

      // Draw topic abbreviation
      ctx.fillStyle = 'var(--terminal-green)';
      ctx.font = '10px Monaco';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const abbrev = node.topic.slice(0, 3).toUpperCase();
      ctx.fillText(abbrev, node.x, node.y);
    });
  };

  const getRarityBorderWidth = (rarity: string): number => {
    switch (rarity) {
      case 'normal': return 1;
      case 'rare': return 2;
      case 'legendary': return 3;
      case 'unique': return 4;
      default: return 1;
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      'Sciences': '#3b82f6',      // blue
      'Mathematics': '#10b981',    // green
      'Technology': '#8b5cf6',     // purple
      'Humanities': '#f59e0b',     // yellow
      'Arts': '#ec4899',          // pink
      'Skills': '#f97316',        // orange
      'Languages': '#ef4444'      // red
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const radius = 8 + (node.difficulty * 3);
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleCenter = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const CATEGORIES = [
    'Sciences', 'Mathematics', 'Technology', 'Humanities', 
    'Arts', 'Skills', 'Languages'
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--terminal-green)] mb-2">
          KNOWLEDGE CONSTELLATION
        </h1>
        <p className="text-gray-400">
          Your learning journey mapped across the cosmic tree of knowledge
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--terminal-gray)] terminal-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-[var(--terminal-green)]">
            {stats.totalNodes}
          </div>
          <div className="text-sm text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-[var(--terminal-gray)] border border-[var(--rarity-rare)] rounded p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--rarity-rare)' }}>
            {stats.rareNodes + stats.legendaryNodes + stats.uniqueNodes}
          </div>
          <div className="text-sm text-gray-400">Rare+</div>
        </div>
        <div className="bg-[var(--terminal-gray)] border border-[var(--rarity-legendary)] rounded p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--rarity-legendary)' }}>
            {stats.legendaryNodes}
          </div>
          <div className="text-sm text-gray-400">Legendary</div>
        </div>
        <div className="bg-[var(--terminal-gray)] border border-[var(--rarity-unique)] rounded p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--rarity-unique)' }}>
            {stats.uniqueNodes}
          </div>
          <div className="text-sm text-gray-400">Unique</div>
        </div>
      </div>

      {/* Constellation Canvas */}
      <div 
        ref={containerRef}
        className="bg-black terminal-border rounded-lg relative overflow-hidden"
        style={{ height: '600px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          width={800}
          height={600}
          onClick={handleCanvasClick}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            onClick={handleZoomIn}
            className="bg-[var(--terminal-gray)] terminal-border px-3 py-1 text-sm hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg)]"
          >
            🔍+ Zoom In
          </Button>
          <Button
            onClick={handleZoomOut}
            className="bg-[var(--terminal-gray)] terminal-border px-3 py-1 text-sm hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg)]"
          >
            🔍- Zoom Out
          </Button>
          <Button
            onClick={handleCenter}
            className="bg-[var(--terminal-gray)] terminal-border px-3 py-1 text-sm hover:bg-[var(--terminal-green)] hover:text-[var(--terminal-bg)]"
          >
            🎯 Center
          </Button>
        </div>

        {/* Node Details Popup */}
        {selectedNode && (
          <div className="absolute top-4 left-4 bg-[var(--terminal-gray)] terminal-border rounded-lg p-4 max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[var(--terminal-green)]">
                {selectedNode.topic}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-[var(--terminal-green)]"
              >
                ✕
              </button>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Category:</strong> {selectedNode.category}</div>
              <div><strong>Difficulty:</strong> {selectedNode.difficulty}/5</div>
              <div>
                <strong>Rarity:</strong>{' '}
                <span style={{ color: RarityCalculator.getRarityColor(selectedNode.rarity) }}>
                  {selectedNode.rarity.toUpperCase()}
                </span>
              </div>
              {selectedNode.connections.length > 0 && (
                <div>
                  <strong>Connections:</strong> {selectedNode.connections.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 text-sm">
        {CATEGORIES.map(category => (
          <div key={category} className="text-center">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-1"
              style={{ backgroundColor: getCategoryColor(category) }}
            ></div>
            {category}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            Your knowledge constellation is empty
          </p>
          <p className="text-gray-500">
            Complete learning sessions in the Chat to start building your constellation
          </p>
        </div>
      )}
    </div>
  );
}
