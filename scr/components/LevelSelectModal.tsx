import React from 'react';
import { LevelConfig, LevelProgress } from '../types';
import { LEVELS, ENDLESS_LEVEL_CONFIG } from '../data/levelsData';
import { Star, Lock, X, Play, Infinity } from 'lucide-react';
import { sound } from '../services/audio';

interface LevelSelectModalProps {
  currentLevelId: number;
  progressMap: Record<number, LevelProgress>;
  totalStars: number;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  progressMap,
  totalStars,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-[#59270b] via-[#3d1805] to-[#1c0b02] border-3 border-[#fbbf24] rounded-3xl p-5 shadow-[0_0_30px_rgba(251,191,36,0.4)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-yellow-300 font-['Lilita_One',sans-serif] tracking-wide">
              LEVEL SELECT
            </h2>
            <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-amber-600/60 text-xs font-black text-amber-200">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>{totalStars}</span>
            </div>
          </div>

          <button
            id="btn-close-level-select"
            onClick={() => { sound.playButton(); onClose(); }}
            className="p-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endless Mode Showcase Card */}
        <div className="my-3">
          <button
            id="btn-level-endless"
            onClick={() => {
              sound.playButton();
              onSelectLevel(ENDLESS_LEVEL_CONFIG);
              onClose();
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-2 border-yellow-300 shadow-md hover:brightness-110 active:scale-98 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-yellow-300/60 flex items-center justify-center text-yellow-300">
                <Infinity className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-white font-black text-sm font-['Lilita_One',sans-serif]">
                  Classic Endless Mode
                </div>
                <div className="text-amber-100 text-[11px] font-bold">
                  No life limit • Unlimited cascades!
                </div>
              </div>
            </div>
            <div className="px-3 py-1 bg-yellow-400 text-stone-950 rounded-xl text-xs font-black">
              PLAY
            </div>
          </button>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 my-2">
          {LEVELS.map((lvl) => {
            const prog = progressMap[lvl.id];
            const isUnlocked = lvl.id === 1 || prog?.unlocked;
            const stars = prog?.stars || 0;
            const isCurrent = currentLevelId === lvl.id;

            return (
              <button
                key={lvl.id}
                id={`btn-level-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playButton();
                    onSelectLevel(lvl);
                    onClose();
                  }
                }}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition transform active:scale-95 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-500 to-yellow-400 border-white ring-3 ring-yellow-300 shadow-[0_0_15px_#f59e0b]'
                    : isUnlocked
                    ? 'bg-gradient-to-b from-[#944d18] to-[#59270b] border-amber-500/80 hover:border-yellow-300 shadow-md'
                    : 'bg-stone-900/80 border-stone-800 text-stone-600 opacity-60 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className={`text-base font-black font-['Fredoka',sans-serif] ${isCurrent ? 'text-stone-950' : 'text-white'}`}>
                      {lvl.id}
                    </span>
                    {/* Stars Earned */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= stars
                              ? 'fill-yellow-300 text-yellow-300'
                              : 'text-amber-950/80 fill-amber-950/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Lock className="w-5 h-5 text-stone-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
