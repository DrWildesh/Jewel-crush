import React, { useState, useEffect } from 'react';
import { getRandomTestAd, AdContent, GOOGLE_ADMOB_TEST_UNITS } from '../services/admobService';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from '../services/audio';

interface AdMobInterstitialModalProps {
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({ onClose }) => {
  const [ad] = useState<AdContent>(getRandomTestAd());
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    sound.playButton();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-[480px] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-purple-500 rounded-3xl p-4 flex flex-col justify-between text-white shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 rounded-full text-[11px] text-purple-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AdMob Test Interstitial</span>
          </div>

          {canClose ? (
            <button
              id="btn-close-interstitial-ad"
              onClick={handleClose}
              className="p-1 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
              title="Close Ad"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-xs bg-black/60 px-2.5 py-1 rounded-full border border-slate-700 font-mono text-slate-400">
              Skip in {secondsLeft}s
            </div>
          )}
        </div>

        {/* Ad Showcase Body */}
        <div className={`my-auto rounded-2xl p-6 bg-gradient-to-br ${ad.bgColor} border border-white/20 text-center flex flex-col items-center justify-center shadow-inner relative overflow-hidden`}>
          <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/30 flex items-center justify-center text-3xl mb-3 shadow-lg">
            {ad.icon}
          </div>

          <h3 className="text-lg font-black text-white leading-tight mb-1 font-['Lilita_One',sans-serif]">
            {ad.advertiser}
          </h3>

          <p className="text-slate-200 text-xs line-clamp-3 mb-3">
            {ad.body}
          </p>

          <div className="inline-flex items-center gap-1 text-yellow-300 text-xs font-bold mb-4">
            <span>★★★★★</span>
            <span>({ad.rating}) • {ad.category}</span>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="z-10 text-center space-y-2">
          <div className="text-[10px] text-slate-400 font-mono">
            Unit: {GOOGLE_ADMOB_TEST_UNITS.INTERSTITIAL}
          </div>

          <div className="flex items-center gap-2">
            {canClose && (
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold text-xs transition"
              >
                Close
              </button>
            )}

            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <span>{ad.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
