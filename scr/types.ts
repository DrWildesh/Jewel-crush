export type GemType = 'ruby' | 'sapphire' | 'topaz' | 'emerald' | 'amethyst' | 'amber';

export type SpecialType = 'normal' | 'striped_v' | 'striped_h' | 'bomb' | 'rainbow';

export type ObstacleType = 'none' | 'ice' | 'stone';

export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
  isHint?: boolean;
  obstacle?: ObstacleType;
  iceHealth?: number; // 1 or 2
  stoneHealth?: number; // 1
}

export interface FloatingScore {
  id: string;
  x: number; // percentage or px
  y: number;
  text: string;
  color: string;
  isBig?: boolean;
  createdAt: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  shape?: 'star' | 'circle' | 'sparkle';
}

export interface LaserBeam {
  id: string;
  direction: 'row' | 'col';
  index: number;
  color: string;
  createdAt: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  moves: number;
  targets: Partial<Record<GemType, number>>;
  iceTargets?: number;
  stoneTargets?: number;
  starScores: [number, number, number]; // 1-star, 2-stars, 3-stars
  boardRows: number;
  boardCols: number;
  blockedCells?: [number, number][]; // cells where no jewel exists
  initialIce?: [number, number][];
  initialStones?: [number, number][];
  description: string;
}

export type PowerUpType = 'hammer' | 'swap' | 'rainbow' | 'lightning';

export interface PowerUpInventory {
  hammer: number;
  swap: number;
  rainbow: number;
  lightning: number;
}

export interface AdMobConfig {
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
  testMode: boolean;
  bannerPosition: 'bottom' | 'top';
  isBannerVisible: boolean;
}

export interface AdMobStats {
  rewardedWatched: number;
  interstitialsShown: number;
  bannerImpressions: number;
  estimatedEarningsUsd: number;
}

export interface LevelProgress {
  levelId: number;
  stars: number; // 0 to 3
  highScore: number;
  unlocked: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  bgmEnabled: boolean;
  sfxVolume: number;
  bgmVolume: number;
  haptics: boolean;
}
