import React from 'react';
import { Volume2, VolumeX, Music, X, HelpCircle, Sparkles, Zap, RotateCcw } from 'lucide-react';
import { sound } from '../services/audio';

interface SettingsModalProps {
  soundEnabled: boolean;
  bgmEnabled: boolean;
  sfxVolume: number;
  bgmVolume: number;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onChangeSfxVolume: (vol: number) => void;
  onChangeBgmVolume: (vol: number) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  bgmEnabled,
  sfxVolume,
  bgmVolume,
  onToggleSound,
  onToggleBgm,
  onChangeSfxVolume,
  onChangeBgmVolume,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-[#59270b] via-[#3d1805] to-[#1c0b02] border-3 border-[#fbbf24] rounded-3xl p-5 shadow-[0_0_30px_rgba(251,191,36,0.4)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/80">
          <h2 className="text-xl font-black text-yellow-300 font-['Lilita_One',sans-serif] tracking-wide">
            SETTINGS & GUIDE
          </h2>
          <button
            id="btn-close-settings"
            onClick={() => { sound.playButton(); onClose(); }}
            className="p-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-left">
          {/* Audio Controls */}
          <div className="bg-black/40 border border-amber-800/60 rounded-2xl p-3.5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 font-['Lilita_One',sans-serif]">
              Audio & Music Synthesizer
            </h3>

            {/* BGM Loop Control */}
            <div>
              <div className="flex items-center justify-between text-xs text-amber-200 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>BGM Melody Loop: {bgmEnabled ? 'ON' : 'OFF'}</span>
                </span>
                <button
                  id="btn-settings-bgm-toggle"
                  onClick={() => { sound.playButton(); onToggleBgm(); }}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black border transition ${
                    bgmEnabled
                      ? 'bg-amber-500 border-amber-300 text-stone-950'
                      : 'bg-stone-800 border-stone-600 text-stone-400'
                  }`}
                >
                  {bgmEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                disabled={!bgmEnabled}
                onChange={(e) => onChangeBgmVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* SFX Control */}
            <div>
              <div className="flex items-center justify-between text-xs text-amber-200 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Sound Effects: {soundEnabled ? 'ON' : 'OFF'}</span>
                </span>
                <button
                  id="btn-settings-sfx-toggle"
                  onClick={() => { sound.playButton(); onToggleSound(); }}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black border transition ${
                    soundEnabled
                      ? 'bg-amber-500 border-amber-300 text-stone-950'
                      : 'bg-stone-800 border-stone-600 text-stone-400'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                disabled={!soundEnabled}
                onChange={(e) => onChangeSfxVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Special Gems Recipe Guide */}
          <div className="bg-black/40 border border-amber-800/60 rounded-2xl p-3.5 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 font-['Lilita_One',sans-serif] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Special Gem Combinations</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-900/50">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>⚡ Striped Gem</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Match 4 in a row/col. Blasts full row or column!
                </p>
              </div>

              <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-900/50">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>💣 Bomb Gem</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Match 5 in T or L shape. Explodes 3x3 surrounding gems!
                </p>
              </div>

              <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-900/50">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>🌟 Rainbow Bomb</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Match 5 in a straight line. Clears all gems of chosen color!
                </p>
              </div>

              <div className="bg-stone-900/60 p-2 rounded-xl border border-amber-900/50">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>✨ Combo Combos!</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Swap two specials together for mega board clearing effects!
                </p>
              </div>
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            <button
              id="btn-reset-data"
              onClick={() => {
                if (window.confirm('Reset all level progress and high scores?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Save Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
