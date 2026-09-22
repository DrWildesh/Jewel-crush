// Official Google AdMob Test Ad Units & Simulation Service

export const GOOGLE_ADMOB_TEST_UNITS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
  APP_OPEN: 'ca-app-pub-3940256099942544/9257395921',
  NATIVE_ADVANCED: 'ca-app-pub-3940256099942544/2247696110',
};

export interface AdContent {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  rating: number;
  badge: string;
  category: string;
  bgColor: string;
  accentColor: string;
  icon: string;
  videoDurationSec: number;
}

export const MOCK_TEST_ADS: AdContent[] = [
  {
    id: 'ad_puzzle_quest',
    advertiser: 'Jewel Kingdom: Gem Blast',
    headline: 'Match Gems, Defeat Dragon Bosses!',
    body: 'Over 2,000 legendary jewel puzzle levels. Free to play with daily diamond rewards.',
    cta: 'Install Now',
    rating: 4.8,
    badge: 'Ad • Test Ad (Google AdMob)',
    category: 'Casual Puzzle',
    bgColor: 'from-amber-900 via-orange-950 to-amber-950',
    accentColor: '#f59e0b',
    icon: '💎',
    videoDurationSec: 5,
  },
  {
    id: 'ad_royal_match',
    advertiser: 'King Castle Match-3',
    headline: 'Help the King Build His Golden Palace',
    body: 'No WiFi needed! Solve relaxing jewel puzzles and unlock royal chambers.',
    cta: 'Play Free',
    rating: 4.9,
    badge: 'Ad • Test Ad (Google AdMob)',
    category: 'Match-3 Fun',
    bgColor: 'from-blue-900 via-indigo-950 to-slate-950',
    accentColor: '#38bdf8',
    icon: '👑',
    videoDurationSec: 5,
  },
  {
    id: 'ad_google_play',
    advertiser: 'Google Play Pass',
    headline: 'Hundreds of Games, No Ads or IAP',
    body: 'Get full access to top match-3, arcade, and puzzle games with family sharing.',
    cta: 'Try 1 Month Free',
    rating: 4.9,
    badge: 'Ad • Google Official Partner',
    category: 'Gaming Pass',
    bgColor: 'from-emerald-900 via-teal-950 to-slate-950',
    accentColor: '#10b981',
    icon: '🎮',
    videoDurationSec: 5,
  },
  {
    id: 'ad_magic_alchemy',
    advertiser: 'Mystic Potion Lab Match',
    headline: 'Brew Legendary Potions & Spells',
    body: 'Connect matching mana crystals and explode colorful runes in this magical puzzle.',
    cta: 'Download Today',
    rating: 4.7,
    badge: 'Ad • Test Ad (Google AdMob)',
    category: 'Magic Arcade',
    bgColor: 'from-purple-900 via-fuchsia-950 to-slate-950',
    accentColor: '#c084fc',
    icon: '✨',
    videoDurationSec: 5,
  },
];

export function getRandomTestAd(): AdContent {
  const idx = Math.floor(Math.random() * MOCK_TEST_ADS.length);
  return MOCK_TEST_ADS[idx];
}

// Calculate simulated ad revenue based on real-world eCPM
export function calculateAdRevenue(type: 'rewarded' | 'interstitial' | 'banner'): number {
  switch (type) {
    case 'rewarded':
      // Average Rewarded Video eCPM: ~$22.00 / 1000 = $0.022 per view
      return 0.022 + Math.random() * 0.006;
    case 'interstitial':
      // Average Interstitial eCPM: ~$9.00 / 1000 = $0.009 per view
      return 0.008 + Math.random() * 0.003;
    case 'banner':
      // Average Banner eCPM: ~$1.20 / 1000 = $0.0012 per impression
      return 0.0012;
  }
}
