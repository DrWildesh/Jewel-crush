import React from 'react';
import { LevelConfig, GemType } from '../types';
import { JewelItem } from './JewelItem';
import { Settings, Volume2, VolumeX, Music, RotateCcw, Map, ShieldAlert } from 'lucide-react';
import { sound } from '../services/audio';

interface TopHeaderProps {
  level: LevelConfig;
  score: number;
  movesLeft: number;
  remainingTargets: Partial<Record<GemType, number>>;
  remainingIce: number;
  remainingStones: number;
  starsEarned: number;
  onOpenSettings: () => void;
  onOpenLevels: () => void;
  onRestartLevel: () => void;
  onOpenAdDev: () => void;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  level,
  score,
  movesLeft,
  remainingTargets,
  remainingIce,
  remainingStones,
  starsEarned,
  onOpenSettings,
  onOpenLevels,
  onRestartLevel,
  onOpenAdDev,
  soundEnabled,
  bgmEnabled,
  onToggleSound,
  onToggleBgm,
}) => {
  const [star1, star2, star3] = level.starScores;
  const maxScore = star3 * 1.15;
  const progressPct = Math.min(100, Math.max(0, (score / maxScore) * 100));

  return (
    <header className="w-full max-w-md mx-auto mb-2 select-none">
      {/* Top Quick Actions Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-black/40 backdrop-blur-sm rounded-t-xl text-xs text-amber-200 border-x border-t border-amber-900/60">
        <div className="flex items-center gap-2">
          <button
            id="btn-level-map"
            onClick={() => { sound.playButton(); onOpenLevels(); }}
            className="flex items-center gap-1 bg-amber-950/80 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-700/50 transition font-bold"
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>{level.id === 999 ? 'Endless' : `Lvl ${level.id}`}</span>
          </button>

          <button
            id="btn-restart"
            onClick={() => { sound.playButton(); onRestartLevel(); }}
            className="p-1 text-amber-300/80 hover:text-amber-100 transition rounded hover:bg-amber-900/40"
            title="Restart Level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio / BGM Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-toggle-bgm"
            onClick={() => { sound.playButton(); onToggleBgm(); }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold border transition ${
              bgmEnabled
                ? 'bg-amber-900/70 border-amber-500 text-amber-300'
                : 'bg-stone-900/70 border-stone-700 text-stone-500 line-through'
            }`}
            title="Toggle BGM Music"
          >
            <Music className="w-3 h-3" />
            <span>BGM</span>
          </button>

          <button
            id="btn-toggle-sfx"
            onClick={() => { sound.playButton(); onToggleSound(); }}
            className={`p-1 rounded border transition ${
              soundEnabled
                ? 'bg-amber-900/70 border-amber-500 text-amber-300'
                : 'bg-stone-900/70 border-stone-700 text-stone-500'
            }`}
            title="Toggle Sound SFX"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-admob-dev"
            onClick={() => { sound.playButton(); onOpenAdDev(); }}
            className="flex items-center gap-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-600/50 transition"
            title="AdMob Test Ads Inspector"
          >
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span>Ads</span>
          </button>

          <button
            id="btn-settings"
            onClick={() => { sound.playButton(); onOpenSettings(); }}
            className="p-1 text-amber-300/80 hover:text-amber-100 transition rounded hover:bg-amber-900/40"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Arcade Wooden Gold Frame (Matches the screenshot) */}
      <div className="relative bg-gradient-to-b from-[#944d18] via-[#6f330a] to-[#451e06] p-2.5 rounded-b-2xl border-2 border-[#d97706] shadow-xl flex items-center justify-between gap-2 overflow-visible">
        {/* Subtle wood grain border highlights */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 opacity-60" />

        {/* LEFT: Stars Progress Gauge + Score */}
        <div className="flex-1 flex flex-col items-start min-w-0 pr-1">
          {/* Star Progress Bar */}
          <div className="relative w-full max-w-[125px] h-4 bg-[#231005] rounded-full border border-amber-600/80 p-0.5 shadow-inner mb-1">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-blue-400 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${progressPct}%` }}
            />
            {/* 3 Stars Markers */}
            <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
              {[star1, star2, star3].map((threshold, idx) => {
                const isLit = score >= threshold;
                return (
                  <span
                    key={idx}
                    className={`text-sm transform -translate-y-0.5 filter transition-all duration-300 ${
                      isLit
                        ? 'text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)] scale-125'
                        : 'text-amber-950/90 grayscale opacity-70 scale-90'
                    }`}
                  >
                    ⭐
                  </span>
                );
              })}
            </div>
          </div>

          {/* Score Typography */}
          <div className="flex items-baseline gap-1">
            <span className="text-yellow-300 text-sm font-bold drop-shadow-[0_2px_2px_#000] font-['Lilita_One',sans-serif] tracking-wider">
              score:
            </span>
            <span className="text-white text-base font-black tracking-wide drop-shadow-[0_2px_3px_#000] font-['Fredoka',sans-serif]">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CENTER: Big 3D Wooden/Amber Badge for MOVES */}
        <div className="relative -my-3 z-10">
          <div className="w-18 h-18 bg-gradient-to-b from-[#f97316] via-[#ea580c] to-[#9a3412] rounded-2xl border-3 border-[#fbbf24] shadow-[0_6px_0_#7c2d12,0_8px_15px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-1 transform transition hover:scale-105 active:scale-95">
            {/* Top Shine */}
            <div className="absolute top-1 inset-x-2 h-2 bg-white/30 rounded-t-lg" />
            
            <div className="text-white text-2xl font-black leading-none drop-shadow-[0_2px_3px_#000] font-['Lilita_One',sans-serif]">
              {level.id === 999 ? '∞' : movesLeft}
            </div>
            <div className="text-amber-100 text-[10px] font-extrabold uppercase tracking-wider drop-shadow font-['Fredoka',sans-serif]">
              {level.id === 999 ? 'Endless' : 'moves'}
            </div>
          </div>
        </div>

        {/* RIGHT: Target Jewel & Objective Container */}
        <div className="flex-1 flex flex-col items-end min-w-0 pl-1">
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Target Gems */}
            {Object.entries(remainingTargets).map(([gemTypeKey, count]) => {
              const gemType = gemTypeKey as GemType;
              const countNum = typeof count === 'number' ? count : 0;
              const isDone = countNum <= 0;
              return (
                <div key={gemType} className="flex items-center gap-1 relative bg-black/40 px-1.5 py-0.5 rounded-lg border border-amber-700/50">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <JewelItem
                      gem={{
                        id: `target-${gemType}`,
                        type: gemType,
                        special: 'normal',
                        row: 0,
                        col: 0,
                      }}
                      size={20}
                    />
                  </div>
                  <span className={`text-xs font-black font-['Fredoka',sans-serif] ${isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                    {isDone ? '✓' : countNum}
                  </span>
                </div>
              );
            })}

            {/* Ice Target */}
            {level.iceTargets !== undefined && level.iceTargets > 0 && (
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-lg border border-sky-600/50">
                <span className="text-xs">❄️</span>
                <span className={`text-xs font-black font-['Fredoka',sans-serif] ${remainingIce <= 0 ? 'text-emerald-400' : 'text-sky-200'}`}>
                  {remainingIce <= 0 ? '✓' : remainingIce}
                </span>
              </div>
            )}

            {/* Stone Target */}
            {level.stoneTargets !== undefined && level.stoneTargets > 0 && (
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-lg border border-stone-600/50">
                <span className="text-xs">🗿</span>
                <span className={`text-xs font-black font-['Fredoka',sans-serif] ${remainingStones <= 0 ? 'text-emerald-400' : 'text-stone-200'}`}>
                  {remainingStones <= 0 ? '✓' : remainingStones}
                </span>
              </div>
            )}
          </div>

          <div className="text-amber-200 text-[11px] font-bold mt-0.5 font-['Lilita_One',sans-serif] tracking-wider drop-shadow">
            target
          </div>
        </div>
      </div>
    </header>
  );
};
