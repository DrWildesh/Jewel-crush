import React, { useState, useRef, useEffect } from 'react';
import { Gem, LevelConfig, LaserBeam, FloatingScore, PowerUpType } from '../types';
import { JewelItem } from './JewelItem';
import { isCellBlocked, GEM_COLORS } from '../utils/jewelEngine';

interface GameBoardProps {
  board: (Gem | null)[][];
  level: LevelConfig;
  selectedGem: [number, number] | null;
  hintMove: { from: [number, number]; to: [number, number] } | null;
  laserBeams: LaserBeam[];
  floatingScores: FloatingScore[];
  activePowerUp: PowerUpType | null;
  onCellClick: (row: number, col: number) => void;
  onSwap: (r1: number, c1: number, r2: number, c2: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  level,
  selectedGem,
  hintMove,
  laserBeams,
  floatingScores,
  activePowerUp,
  onCellClick,
  onSwap,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ row: number; col: number; x: number; y: number } | null>(null);

  const rows = level.boardRows;
  const cols = level.boardCols;

  // Handle Touch/Pointer Swiping
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (activePowerUp) {
      onCellClick(r, c);
      return;
    }
    const gem = board[r]?.[c];
    if (!gem || gem.obstacle === 'stone') return;

    setDragStart({ row: r, col: c, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const threshold = 22; // px to register swipe

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const { row, col } = dragStart;
      let targetRow = row;
      let targetCol = col;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }

      if (
        targetRow >= 0 &&
        targetRow < rows &&
        targetCol >= 0 &&
        targetCol < cols &&
        !isCellBlocked(level, targetRow, targetCol) &&
        board[targetRow][targetCol]?.obstacle !== 'stone'
      ) {
        onSwap(row, col, targetRow, targetCol);
      }

      setDragStart(null);
    }
  };

  const handlePointerUp = () => {
    setDragStart(null);
  };

  return (
    <div
      ref={boardRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full max-w-md mx-auto aspect-square p-2 rounded-2xl bg-gradient-to-b from-[#2b1509] via-[#1c0e06] to-[#120803] border-3 border-[#c27803] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.7)] select-none overflow-hidden ${
        activePowerUp ? 'cursor-crosshair ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Background Checkered Stone Tile Pattern */}
      <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-1 pointer-events-none rounded-xl overflow-hidden opacity-90">
        {Array.from({ length: 64 }).map((_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const isBlocked = isCellBlocked(level, r, c);
          if (isBlocked) {
            return <div key={i} className="bg-transparent" />;
          }
          const isDark = (r + c) % 2 === 1;
          return (
            <div
              key={i}
              className={`rounded-lg transition-colors ${
                isDark ? 'bg-[#3b2314]/80' : 'bg-[#29170c]/80'
              } border border-amber-950/40 shadow-inner`}
            />
          );
        })}
      </div>

      {/* Grid of Gems */}
      <div
        className="relative z-10 w-full h-full grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {board.map((rowGems, r) =>
          rowGems.map((gem, c) => {
            const isBlocked = isCellBlocked(level, r, c);
            if (isBlocked || !gem) {
              return <div key={`empty-${r}-${c}`} className="w-full h-full" />;
            }

            const isSelected = selectedGem ? selectedGem[0] === r && selectedGem[1] === c : false;
            const isHint = hintMove
              ? (hintMove.from[0] === r && hintMove.from[1] === c) ||
                (hintMove.to[0] === r && hintMove.to[1] === c)
              : false;

            return (
              <div
                key={gem.id}
                id={`cell-${r}-${c}`}
                onPointerDown={(e) => handlePointerDown(r, c, e)}
                onClick={() => onCellClick(r, c)}
                className="w-full h-full flex items-center justify-center p-0.5"
              >
                <JewelItem
                  gem={gem}
                  isSelected={isSelected}
                  isHint={isHint}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Laser Beam Effects (Zapping vertical or horizontal columns/rows as seen in screenshot) */}
      {laserBeams.map((beam) => {
        const isCol = beam.direction === 'col';
        const colPct = (beam.index / cols) * 100 + 100 / (cols * 2);
        const rowPct = (beam.index / rows) * 100 + 100 / (rows * 2);

        return (
          <div
            key={beam.id}
            className="absolute pointer-events-none z-30 animate-pulse"
            style={{
              ...(isCol
                ? {
                    left: `${colPct}%`,
                    top: 0,
                    bottom: 0,
                    width: '18px',
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(to right, transparent, rgba(255,255,255,0.9), ${beam.color}, transparent)`,
                    boxShadow: `0 0 25px 8px ${beam.color}`,
                  }
                : {
                    top: `${rowPct}%`,
                    left: 0,
                    right: 0,
                    height: '18px',
                    transform: 'translateY(-50%)',
                    background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), ${beam.color}, transparent)`,
                    boxShadow: `0 0 25px 8px ${beam.color}`,
                  }),
            }}
          >
            {/* Core Bright Light */}
            <div
              className={`w-full h-full ${
                isCol ? 'bg-white shadow-[0_0_15px_#ffffff]' : 'bg-white shadow-[0_0_15px_#ffffff]'
              } opacity-90`}
            />
          </div>
        );
      })}

      {/* Floating Animated Score Numbers & Radiant Burst (As in screenshot e.g. 20, 30, 40, 10!) */}
      {floatingScores.map((scoreItem) => (
        <div
          key={scoreItem.id}
          className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-out fade-out zoom-out duration-700 flex flex-col items-center"
          style={{
            left: `${scoreItem.x}%`,
            top: `${scoreItem.y}%`,
            animation: 'floatUp 0.9s ease-out forwards',
          }}
        >
          {/* Radiant Starburst Flare */}
          {scoreItem.isBig && (
            <div className="absolute -inset-6 bg-gradient-to-r from-yellow-300/30 via-white/50 to-yellow-300/30 rounded-full blur-md animate-spin" style={{ animationDuration: '3s' }} />
          )}

          <span
            className={`font-black tracking-wider font-['Fredoka',sans-serif] ${
              scoreItem.isBig
                ? 'text-yellow-300 text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] scale-110'
                : 'text-white text-lg drop-shadow-[0_2px_4px_#000]'
            }`}
            style={{ color: scoreItem.color || '#fff' }}
          >
            {scoreItem.text}
          </span>
        </div>
      ))}

      {/* Active Booster Banner Overlay if active */}
      {activePowerUp && (
        <div className="absolute top-2 inset-x-2 bg-amber-500/90 text-black text-xs font-black py-1 px-3 rounded-lg text-center shadow-lg pointer-events-none z-50 flex items-center justify-center gap-2 animate-bounce">
          <span>Tap any jewel to use {activePowerUp.toUpperCase()}!</span>
        </div>
      )}
    </div>
  );
};
