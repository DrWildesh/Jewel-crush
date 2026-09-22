import React, { useState, useEffect } from 'react';
import { getRandomTestAd, AdContent, GOOGLE_ADMOB_TEST_UNITS } from '../services/admobService';
import { X, CheckCircle, Video, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface AdMobRewardedModalProps {
  rewardTitle?: string;
  onRewardEarned: () => void;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  rewardTitle = '+5 Extra Moves',
  onRewardEarned,
  onClose,
}) => {
  const [ad] = useState<AdContent>(getRandomTestAd());
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [rewardGranted, setRewardGranted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRewardGranted(true);
          sound.playStarDing(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaimReward = () => {
    sound.playButton();
    onRewardEarned();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-[480px] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-emerald-500 rounded-3xl p-4 flex flex-col justify-between text-white shadow-2xl overflow-hidden">
        {/* Top Ad Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 rounded-full text-[11px] text-emerald-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AdMob Test Video</span>
          </div>

          {rewardGranted ? (
            <button
              id="btn-close-rewarded-ad"
              onClick={handleClaimReward}
              className="p-1 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition"
              title="Claim Reward & Close"
            >
              <X className="w-5 h-5 font-black" />
            </button>
          ) : (
            <div className="text-xs bg-black/60 px-2.5 py-1 rounded-full border border-slate-700 font-mono text-amber-300 font-bold">
              Reward in {secondsLeft}s
            </div>
          )}
        </div>

        {/* Video Simulation Center Stage */}
        <div className={`my-auto rounded-2xl p-6 bg-gradient-to-br ${ad.bgColor} border border-white/20 text-center flex flex-col items-center justify-center shadow-inner relative overflow-hidden`}>
          {/* Animated Background Rays */}
          <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spin" style={{ animationDuration: '6s' }} />

          <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/30 flex items-center justify-center text-3xl mb-3 shadow-lg z-10">
            {ad.icon}
          </div>

          <h3 className="text-lg font-black text-white leading-tight mb-1 font-['Lilita_One',sans-serif] z-10">
            {ad.advertiser}
          </h3>

          <p className="text-slate-200 text-xs line-clamp-2 mb-3 z-10">
            {ad.headline}
          </p>

          <div className="inline-flex items-center gap-1 text-yellow-300 text-xs font-bold mb-4 z-10">
            <span>★★★★★</span>
            <span>({ad.rating})</span>
          </div>

          {/* Reward Status */}
          {rewardGranted ? (
            <div className="bg-emerald-500/90 text-black font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1 animate-bounce z-10 font-['Fredoka',sans-serif]">
              <Sparkles className="w-4 h-4" />
              <span>Reward Unlocked: {rewardTitle}!</span>
            </div>
          ) : (
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/20 z-10">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Bottom CTA & Verification */}
        <div className="z-10 text-center space-y-2">
          <div className="text-[10px] text-slate-400 font-mono">
            Unit: {GOOGLE_ADMOB_TEST_UNITS.REWARDED}
          </div>

          {rewardGranted ? (
            <button
              id="btn-claim-reward"
              onClick={handleClaimReward}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-base shadow-[0_0_20px_rgba(52,211,153,0.6)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 font-['Fredoka',sans-serif]"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Claim {rewardTitle}</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-2xl bg-slate-800 text-slate-400 font-bold text-sm opacity-70 cursor-wait"
            >
              Watching Sponsored Ad ({secondsLeft}s)...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
