import React from 'react';
import { PowerUpType, PowerUpInventory } from '../types';
import { Sparkles, Zap, RefreshCw, Hammer, PlusCircle, Video } from 'lucide-react';
import { sound } from '../services/audio';

interface PowerupBarProps {
  inventory: PowerUpInventory;
  activePowerUp: PowerUpType | null;
  onSelectPowerUp: (type: PowerUpType) => void;
  onWatchRewardedForPowerups: () => void;
}

export const PowerupBar: React.FC<PowerupBarProps> = ({
  inventory,
  activePowerUp,
  onSelectPowerUp,
  onWatchRewardedForPowerups,
}) => {
  const powerups: {
    type: PowerUpType;
    label: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
  }[] = [
    {
      type: 'hammer',
      label: 'Hammer',
      icon: <Hammer className="w-5 h-5 text-amber-300" />,
      color: 'from-amber-600 to-amber-800',
      desc: 'Smash any 1 jewel or stone',
    },
    {
      type: 'swap',
      label: 'Free Swap',
      icon: <RefreshCw className="w-5 h-5 text-blue-300" />,
      color: 'from-blue-600 to-blue-800',
      desc: 'Swap any 2 gems freely',
    },
    {
      type: 'rainbow',
      label: 'Rainbow',
      icon: <Sparkles className="w-5 h-5 text-purple-300" />,
      color: 'from-purple-600 to-purple-800',
      desc: 'Spawn a Rainbow Bomb',
    },
    {
      type: 'lightning',
      label: 'Zap',
      icon: <Zap className="w-5 h-5 text-emerald-300" />,
      color: 'from-emerald-600 to-emerald-800',
      desc: 'Zap row and column',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-2 px-1 flex items-center justify-between gap-1.5 select-none">
      {powerups.map((p) => {
        const count = inventory[p.type];
        const isActive = activePowerUp === p.type;

        return (
          <button
            key={p.type}
            id={`btn-powerup-${p.type}`}
            onClick={() => {
              sound.playButton();
              if (count > 0) {
                onSelectPowerUp(p.type);
              } else {
                onWatchRewardedForPowerups();
              }
            }}
            className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border-2 transition-all transform active:scale-95 ${
              isActive
                ? 'bg-gradient-to-b from-yellow-400 to-amber-600 border-white scale-105 shadow-[0_0_12px_#f59e0b]'
                : `bg-gradient-to-b ${p.color} border-amber-500/40 hover:border-amber-400 hover:brightness-110 shadow-md`
            }`}
            title={p.desc}
          >
            {/* Icon */}
            <div className="mb-0.5">{p.icon}</div>

            {/* Label */}
            <span className="text-[10px] font-bold text-white tracking-tight drop-shadow font-['Fredoka',sans-serif]">
              {p.label}
            </span>

            {/* Count Badge or Free Ad badge */}
            <div className="absolute -top-2 -right-1 bg-amber-400 text-black text-[10px] font-black w-5 h-5 rounded-full border border-amber-900 flex items-center justify-center shadow">
              {count > 0 ? (
                count
              ) : (
                <PlusCircle className="w-3.5 h-3.5 text-black" />
              )}
            </div>
          </button>
        );
      })}

      {/* Rewarded Ad Free Booster Trigger */}
      <button
        id="btn-rewarded-booster"
        onClick={() => { sound.playButton(); onWatchRewardedForPowerups(); }}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl bg-gradient-to-b from-emerald-600 to-teal-800 border-2 border-emerald-400 hover:brightness-110 active:scale-95 transition shadow-md"
        title="Watch Ad for +3 Boosters"
      >
        <Video className="w-4 h-4 text-yellow-300" />
        <span className="text-[9px] font-black text-yellow-200 mt-0.5 whitespace-nowrap font-['Fredoka',sans-serif]">
          FREE +3
        </span>
      </button>
    </div>
  );
};
