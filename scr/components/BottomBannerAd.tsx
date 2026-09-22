import React, { useState, useEffect } from 'react';
import { AdMobConfig, AdMobStats } from '../types';
import { GOOGLE_ADMOB_TEST_UNITS, getRandomTestAd, AdContent, calculateAdRevenue } from '../services/admobService';
import { Info, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { sound } from '../services/audio';

interface BottomBannerAdProps {
  config: AdMobConfig;
  stats: AdMobStats;
  onAdImpression: (revenue: number) => void;
  onOpenAdInspector: () => void;
}

export const BottomBannerAd: React.FC<BottomBannerAdProps> = ({
  config,
  stats,
  onAdImpression,
  onOpenAdInspector,
}) => {
  const [currentAd, setCurrentAd] = useState<AdContent>(getRandomTestAd());
  const [impressionCount, setImpressionCount] = useState(0);

  // Auto rotate banner ad every 30 seconds (Standard AdMob behavior)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd(getRandomTestAd());
      const rev = calculateAdRevenue('banner');
      onAdImpression(rev);
      setImpressionCount(prev => prev + 1);
    }, 30000);

    // Initial impression
    const initialRev = calculateAdRevenue('banner');
    onAdImpression(initialRev);

    return () => clearInterval(timer);
  }, []);

  const handleRefreshAd = () => {
    sound.playButton();
    setCurrentAd(getRandomTestAd());
    const rev = calculateAdRevenue('banner');
    onAdImpression(rev);
  };

  if (!config.isBannerVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-3 select-none flex flex-col items-center">
      {/* "No life limit Unlimited play" Warm Banner (Exact look from the screenshot!) */}
      <div className="w-full mb-1.5 py-1.5 px-4 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#d97706] border-2 border-amber-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 transform hover:scale-[1.01] transition">
        <span className="text-xl">💎</span>
        <div className="text-center">
          <div className="text-white font-black text-sm sm:text-base leading-tight drop-shadow-[0_2px_3px_#000] font-['Lilita_One',sans-serif] tracking-wide">
            No life limit • Unlimited play
          </div>
          <div className="text-amber-100 text-[10px] font-bold drop-shadow-sm font-['Fredoka',sans-serif]">
            Play classic match-3 puzzles anytime, anywhere!
          </div>
        </div>
        <span className="text-xl">⭐</span>
      </div>

      {/* Google AdMob Standard 320x50 / Adaptive Test Banner Frame */}
      <div className="w-full bg-[#1e293b] border-2 border-slate-600 rounded-xl overflow-hidden shadow-lg">
        {/* AdMob Test Header Bar */}
        <div className="bg-slate-900 px-2 py-0.5 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/40">
              Ad • Test Ad
            </span>
            <span className="font-mono text-[9px] text-slate-400 hidden sm:inline">
              {GOOGLE_ADMOB_TEST_UNITS.BANNER}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefreshAd}
              className="hover:text-white p-0.5 rounded transition"
              title="Refresh Ad Impression"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onOpenAdInspector}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-bold transition"
              title="Open AdMob Test Inspector"
            >
              <Info className="w-2.5 h-2.5" />
              <span>Inspector</span>
            </button>
          </div>
        </div>

        {/* Ad Content Container */}
        <div className={`p-2 bg-gradient-to-r ${currentAd.bgColor} flex items-center justify-between gap-2.5`}>
          {/* Ad Icon */}
          <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center text-xl shrink-0 shadow">
            {currentAd.icon}
          </div>

          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-xs truncate drop-shadow">
                {currentAd.advertiser}
              </span>
              <span className="text-amber-300 text-[10px] font-bold">
                ★ {currentAd.rating}
              </span>
            </div>
            <p className="text-slate-200 text-[11px] leading-tight truncate">
              {currentAd.headline}
            </p>
          </div>

          {/* Ad CTA Button */}
          <button
            onClick={() => {
              sound.playButton();
              onOpenAdInspector();
            }}
            className="px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shrink-0 shadow-md transition flex items-center gap-1 font-['Fredoka',sans-serif]"
          >
            <span>{currentAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
