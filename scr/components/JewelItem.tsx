import React from 'react';
import { Gem, GemType } from '../types';

interface JewelItemProps {
  gem: Gem;
  isSelected?: boolean;
  isHint?: boolean;
  size?: number;
}

export const JewelItem: React.FC<JewelItemProps> = ({
  gem,
  isSelected = false,
  isHint = false,
  size = 52,
}) => {
  const { type, special, obstacle } = gem;

  // Render Faceted SVG Gem based on type
  const renderGemSvg = (gemType: GemType) => {
    switch (gemType) {
      case 'ruby':
        // Red Octagonal Ruby
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="ruby-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="50%" stopColor="#e60039" />
                <stop offset="100%" stopColor="#800020" />
              </linearGradient>
              <linearGradient id="ruby-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Base Octagon */}
            <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill="url(#ruby-main)" stroke="#ffb3c1" strokeWidth="2.5" />
            {/* Facet bevels */}
            <polygon points="30,8 70,8 60,26 40,26" fill="#ff758f" />
            <polygon points="70,8 92,30 74,40 60,26" fill="#c9184a" />
            <polygon points="92,30 92,70 74,60 74,40" fill="#a01a3e" />
            <polygon points="92,70 70,92 60,74 74,60" fill="#590d22" />
            <polygon points="70,92 30,92 40,74 60,74" fill="#800f2f" />
            <polygon points="30,92 8,70 26,60 40,74" fill="#a01a3e" />
            <polygon points="8,70 8,30 26,40 26,60" fill="#ff4d6d" />
            <polygon points="8,30 30,8 40,26 26,40" fill="#ff758f" />
            {/* Center Table */}
            <polygon points="40,26 60,26 74,40 74,60 60,74 40,74 26,60 26,40" fill="#ff1e56" />
            {/* Sparkle Glint */}
            <polygon points="38,28 50,30 45,45 32,40" fill="url(#ruby-highlight)" />
          </svg>
        );

      case 'sapphire':
        // Blue Triangular / Diamond Sapphire
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="sapph-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <linearGradient id="sapph-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Triangle shape */}
            <polygon points="50,8 92,85 8,85" fill="url(#sapph-main)" stroke="#bae6fd" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Inner facet lines */}
            <polygon points="50,8 50,45 8,85" fill="#0284c7" />
            <polygon points="50,8 92,85 50,45" fill="#0369a1" />
            <polygon points="8,85 50,45 92,85" fill="#0c4a6e" />
            {/* Center Triangle Table */}
            <polygon points="50,25 72,70 28,70" fill="#38bdf8" />
            {/* Glint reflection */}
            <polygon points="50,27 40,55 50,45" fill="url(#sapph-highlight)" />
          </svg>
        );

      case 'topaz':
        // Yellow Citrine / Golden Topaz Square
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="topaz-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="topaz-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Chamfered Square Base */}
            <polygon points="25,8 75,8 92,25 92,75 75,92 25,92 8,75 8,25" fill="url(#topaz-main)" stroke="#fef9c3" strokeWidth="2.5" />
            {/* Facets */}
            <polygon points="25,8 75,8 65,22 35,22" fill="#fef08a" />
            <polygon points="75,8 92,25 78,35 65,22" fill="#facc15" />
            <polygon points="92,25 92,75 78,65 78,35" fill="#ca8a04" />
            <polygon points="92,75 75,92 65,78 78,65" fill="#a16207" />
            <polygon points="75,92 25,92 35,78 65,78" fill="#713f12" />
            <polygon points="25,92 8,75 22,65 35,78" fill="#a16207" />
            <polygon points="8,75 8,25 22,35 22,65" fill="#ca8a04" />
            <polygon points="8,25 25,8 35,22 22,35" fill="#facc15" />
            {/* Center Table */}
            <polygon points="35,22 65,22 78,35 78,65 65,78 35,78 22,65 22,35" fill="#eab308" />
            {/* Shiny Highlight */}
            <polygon points="36,24 60,24 45,45 28,38" fill="url(#topaz-highlight)" />
          </svg>
        );

      case 'emerald':
        // Green Emerald Triangle/Diamond Cut
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="em-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="40%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>
              <linearGradient id="em-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Inverted Triangle / Shield */}
            <polygon points="50,92 8,20 92,20" fill="url(#em-main)" stroke="#bbf7d0" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Facets */}
            <polygon points="8,20 92,20 70,38 30,38" fill="#4ade80" />
            <polygon points="8,20 30,38 50,92" fill="#15803d" />
            <polygon points="92,20 70,38 50,92" fill="#166534" />
            {/* Center Table */}
            <polygon points="30,38 70,38 50,75" fill="#22c55e" />
            {/* Highlight */}
            <polygon points="32,22 68,22 50,38" fill="url(#em-highlight)" />
          </svg>
        );

      case 'amethyst':
        // Purple Amethyst Brilliant Hexagon
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="ameth-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="40%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b0764" />
              </linearGradient>
              <linearGradient id="ameth-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Hexagon Base */}
            <polygon points="50,8 90,28 90,72 50,92 10,72 10,28" fill="url(#ameth-main)" stroke="#f5d0fe" strokeWidth="2.5" />
            {/* Facets */}
            <polygon points="50,8 90,28 72,40 50,25" fill="#e879f9" />
            <polygon points="90,28 90,72 72,60 72,40" fill="#9333ea" />
            <polygon points="90,72 50,92 50,75 72,60" fill="#6b21a8" />
            <polygon points="50,92 10,72 28,60 50,75" fill="#581c87" />
            <polygon points="10,72 10,28 28,40 28,60" fill="#7e22ce" />
            <polygon points="10,28 50,8 50,25 28,40" fill="#c084fc" />
            {/* Center Table */}
            <polygon points="50,25 72,40 72,60 50,75 28,60 28,40" fill="#a855f7" />
            {/* Glint */}
            <polygon points="50,27 68,39 50,48 32,39" fill="url(#ameth-highlight)" />
          </svg>
        );

      case 'amber':
        // Orange Amber Rhombus / Kite
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="amber-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
              <linearGradient id="amber-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Rhombus Diamond */}
            <polygon points="50,8 92,50 50,92 8,50" fill="url(#amber-main)" stroke="#ffedd5" strokeWidth="2.5" />
            {/* Facets */}
            <polygon points="50,8 92,50 65,50 50,30" fill="#fdba74" />
            <polygon points="92,50 50,92 50,70 65,50" fill="#c2410c" />
            <polygon points="50,92 8,50 35,50 50,70" fill="#9a3412" />
            <polygon points="8,50 50,8 50,30 35,50" fill="#fb923c" />
            {/* Center Table */}
            <polygon points="50,30 65,50 50,70 35,50" fill="#ea580c" />
            {/* Glint */}
            <polygon points="50,32 60,45 50,55 40,45" fill="url(#amber-highlight)" />
          </svg>
        );
    }
  };

  // Special Overlays
  const renderSpecialOverlay = () => {
    if (special === 'striped_v') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-around pointer-events-none p-1">
          <div className="w-1.5 h-full bg-white/90 rounded-full shadow-[0_0_8px_#ffffff] animate-pulse" />
          <div className="absolute text-white font-black text-xs drop-shadow-[0_0_4px_#000]">
            ↕
          </div>
        </div>
      );
    }

    if (special === 'striped_h') {
      return (
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none p-1">
          <div className="h-1.5 w-full bg-white/90 rounded-full shadow-[0_0_8px_#ffffff] animate-pulse" />
          <div className="absolute text-white font-black text-xs drop-shadow-[0_0_4px_#000]">
            ↔
          </div>
        </div>
      );
    }

    if (special === 'bomb') {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-amber-300 bg-amber-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
            <span className="text-sm">💥</span>
          </div>
          <div className="absolute -top-1 right-2 text-xs font-bold text-amber-200 animate-bounce">
            💣
          </div>
        </div>
      );
    }

    if (special === 'rainbow') {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-blue-500 to-purple-500 opacity-90 animate-spin flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ animationDuration: '3s' }}>
            <div className="w-4/5 h-4/5 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="text-lg animate-pulse">🌟</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Obstacle Overlay (Ice or Stone)
  const renderObstacleOverlay = () => {
    if (obstacle === 'ice') {
      return (
        <div className="absolute inset-0 rounded-lg bg-sky-200/40 border-2 border-sky-100 shadow-[inset_0_0_8px_rgba(255,255,255,0.7)] pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
          <div className="text-white/80 text-xs font-bold tracking-tighter">❄️</div>
        </div>
      );
    }

    if (obstacle === 'stone') {
      return (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-stone-600 via-stone-700 to-stone-900 border-2 border-stone-400 shadow-md pointer-events-none flex flex-col items-center justify-center">
          <div className="text-stone-300 text-sm font-black">🗿</div>
          <div className="w-3/4 h-0.5 bg-stone-500/60 my-0.5" />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id={`gem-${gem.id}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative flex items-center justify-center cursor-pointer transition-transform duration-150 select-none ${
        isSelected ? 'scale-115 z-20 brightness-125 ring-3 ring-amber-300 rounded-xl bg-amber-400/20' : 'hover:scale-105 active:scale-95'
      } ${isHint ? 'animate-bounce ring-2 ring-yellow-400 rounded-lg' : ''}`}
    >
      {/* Base Gem Graphic */}
      <div className="w-full h-full p-1 transition-all">
        {special === 'rainbow' ? (
          <div className="w-full h-full flex items-center justify-center">
            {renderSpecialOverlay()}
          </div>
        ) : (
          renderGemSvg(type)
        )}
      </div>

      {/* Special Effects Overlay */}
      {special !== 'rainbow' && renderSpecialOverlay()}

      {/* Obstacle Overlay */}
      {renderObstacleOverlay()}
    </div>
  );
};
