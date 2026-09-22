import React, { useState } from 'react';
import { AdMobConfig, AdMobStats } from '../types';
import { GOOGLE_ADMOB_TEST_UNITS } from '../services/admobService';
import { ShieldCheck, Copy, Check, X, Play, Eye, DollarSign, BarChart2 } from 'lucide-react';
import { sound } from '../services/audio';

interface AdMobDevModalProps {
  config: AdMobConfig;
  stats: AdMobStats;
  onClose: () => void;
  onTriggerRewarded: () => void;
  onTriggerInterstitial: () => void;
  onToggleBanner: () => void;
}

export const AdMobDevModal: React.FC<AdMobDevModalProps> = ({
  config,
  stats,
  onClose,
  onTriggerRewarded,
  onTriggerInterstitial,
  onToggleBanner,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    sound.playButton();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-emerald-500/80 rounded-3xl p-5 shadow-[0_0_35px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-black text-white font-['Fredoka',sans-serif]">
                AdMob Test Ads Inspector
              </h2>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Google Official Test Ad Units
              </div>
            </div>
          </div>

          <button
            id="btn-close-ad-inspector"
            onClick={() => { sound.playButton(); onClose(); }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-left">
          {/* Revenue & Performance Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulated Revenue</span>
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                ${stats.estimatedEarningsUsd.toFixed(4)}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Rewarded Views</span>
              </div>
              <div className="text-lg font-black text-amber-300 font-mono">
                {stats.rewardedWatched}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Banner Impressions</span>
              </div>
              <div className="text-lg font-black text-blue-300 font-mono">
                {stats.bannerImpressions}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Play className="w-3.5 h-3.5 text-purple-400" />
                <span>Interstitials</span>
              </div>
              <div className="text-lg font-black text-purple-300 font-mono">
                {stats.interstitialsShown}
              </div>
            </div>
          </div>

          {/* Test Ad Unit IDs list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Google Test Ad Unit IDs
            </h3>

            {Object.entries(GOOGLE_ADMOB_TEST_UNITS).map(([key, unitId]) => {
              const isCopied = copiedKey === key;
              return (
                <div
                  key={key}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs font-mono text-emerald-300 truncate">
                      {unitId}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(key, unitId)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-xs shrink-0"
                    title="Copy Unit ID"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Live Ad Testing Triggers */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Simulate Ad Format Events
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-test-rewarded"
                onClick={() => { sound.playButton(); onTriggerRewarded(); }}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Rewarded Ad</span>
              </button>

              <button
                id="btn-test-interstitial"
                onClick={() => { sound.playButton(); onTriggerInterstitial(); }}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Interstitial Ad</span>
              </button>
            </div>

            <button
              id="btn-toggle-banner"
              onClick={() => { sound.playButton(); onToggleBanner(); }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition"
            >
              {config.isBannerVisible ? 'Hide Bottom Banner' : 'Show Bottom Banner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
