import React, { useEffect } from 'react';
import { LevelConfig } from '../types';
import { Star, Trophy, ArrowRight, RotateCcw, Video, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';

interface WinModalProps {
  level: LevelConfig;
  score: number;
  movesLeft: number;
  starsEarned: number;
  coinsEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onWatchDoubleReward: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  level,
  score,
  movesLeft,
  starsEarned,
  coinsEarned,
  onNextLevel,
  onReplay,
  onWatchDoubleReward,
}) => {
  useEffect(() => {
    sound.playWinFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  const bonusScore = movesLeft * 100;
  const totalFinalScore = score + bonusScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#291004] border-4 border-[#fbbf24] rounded-3xl p-5 shadow-[0_0_35px_rgba(251,191,36,0.5)] text-center overflow-hidden">
        {/* Shiny Top Arch */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 opacity-80" />

        {/* Level Clear Banner */}
        <div className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xl px-6 py-1.5 rounded-full shadow-lg border-2 border-yellow-200 mb-3 uppercase tracking-wider font-['Lilita_One',sans-serif]">
          LEVEL {level.id === 999 ? 'CLEAR!' : `${level.id} CLEAR!`}
        </div>

        {/* 3 Stars Display */}
        <div className="flex items-center justify-center gap-3 my-3">
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= starsEarned;
            return (
              <div
                key={starNum}
                className={`relative transform transition-all duration-500 ${
                  isEarned
                    ? 'scale-125 text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-bounce'
                    : 'scale-95 text-stone-700 opacity-60'
                }`}
                style={{ animationDelay: `${starNum * 150}ms` }}
              >
                <Star className="w-12 h-12 fill-current" />
              </div>
            );
          })}
        </div>

        {/* Score & Rewards Breakdown */}
        <div className="bg-[#1c0c03]/80 border-2 border-amber-800/80 rounded-2xl p-3 my-4 text-left space-y-1.5">
          <div className="flex justify-between text-xs text-amber-200 font-bold">
            <span>Base Score:</span>
            <span className="text-white">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-amber-200 font-bold">
            <span>Moves Bonus ({movesLeft} moves × 100):</span>
            <span className="text-emerald-400">+{bonusScore.toLocaleString()}</span>
          </div>
          <div className="h-px bg-amber-800/60 my-1" />
          <div className="flex justify-between text-base font-black text-yellow-300 font-['Fredoka',sans-serif]">
            <span>Total Score:</span>
            <span>{totalFinalScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-amber-300 font-black pt-1">
            <span>Coins Won:</span>
            <span className="flex items-center gap-1 text-yellow-300">
              🪙 +{coinsEarned}
            </span>
          </div>
        </div>

        {/* Double Reward Video Ad Option */}
        <button
          id="btn-win-double-ad"
          onClick={() => { sound.playButton(); onWatchDoubleReward(); }}
          className="w-full mb-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 border-2 border-emerald-300 text-white font-black text-sm shadow-[0_4px_12px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transform active:scale-95 transition font-['Fredoka',sans-serif]"
        >
          <Video className="w-4 h-4 text-yellow-300" />
          <span>Double Coins (🪙 +{coinsEarned * 2}) • Watch Ad</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-win-replay"
            onClick={() => { sound.playButton(); onReplay(); }}
            className="flex-1 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 text-stone-200 font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-95 font-['Fredoka',sans-serif]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          <button
            id="btn-win-next"
            onClick={() => { sound.playButton(); onNextLevel(); }}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 border-2 border-yellow-200 text-stone-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95 font-['Fredoka',sans-serif]"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
