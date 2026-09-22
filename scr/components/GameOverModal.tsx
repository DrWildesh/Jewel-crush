import React, { useEffect } from 'react';
import { LevelConfig } from '../types';
import { RotateCcw, Video, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface GameOverModalProps {
  level: LevelConfig;
  score: number;
  onRestart: () => void;
  onWatchAdForMoves: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  onRestart,
  onWatchAdForMoves,
}) => {
  useEffect(() => {
    sound.playGameOver();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#5c1d11] via-[#3a0f08] to-[#200703] border-4 border-rose-600 rounded-3xl p-5 shadow-[0_0_35px_rgba(225,29,72,0.5)] text-center overflow-hidden">
        {/* Banner */}
        <div className="inline-block bg-gradient-to-r from-rose-600 to-red-500 text-white font-black text-xl px-6 py-1.5 rounded-full shadow-lg border-2 border-rose-300 mb-3 uppercase tracking-wider font-['Lilita_One',sans-serif]">
          OUT OF MOVES!
        </div>

        <p className="text-amber-200 text-sm mb-4 font-['Fredoka',sans-serif]">
          You were so close! Don't give up on Level {level.id}.
        </p>

        {/* Rewarded Ad to Continue Option */}
        <div className="bg-black/50 border-2 border-emerald-500/60 rounded-2xl p-4 mb-4 text-center">
          <div className="text-emerald-300 font-black text-lg mb-1 flex items-center justify-center gap-1.5 font-['Fredoka',sans-serif]">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            <span>Get +5 Extra Moves!</span>
          </div>
          <p className="text-slate-300 text-xs mb-3">
            Watch a quick sponsor video to keep all your progress and continue right now.
          </p>

          <button
            id="btn-ad-extra-moves"
            onClick={() => { sound.playButton(); onWatchAdForMoves(); }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 border-2 border-emerald-300 text-white font-black text-base shadow-[0_4px_15px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2 transform active:scale-95 transition font-['Fredoka',sans-serif]"
          >
            <Video className="w-5 h-5 text-yellow-300" />
            <span>+5 Moves (Watch Ad)</span>
          </button>
        </div>

        {/* Restart Button */}
        <button
          id="btn-restart-fail"
          onClick={() => { sound.playButton(); onRestart(); }}
          className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 text-stone-300 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 font-['Fredoka',sans-serif]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Level</span>
        </button>
      </div>
    </div>
  );
};
