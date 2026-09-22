import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gem,
  GemType,
  LevelConfig,
  LevelProgress,
  PowerUpType,
  PowerUpInventory,
  AdMobConfig,
  AdMobStats,
  LaserBeam,
  FloatingScore,
} from './types';
import { LEVELS, ENDLESS_LEVEL_CONFIG } from './data/levelsData';
import {
  createInitialBoard,
  findMatches,
  handleSpecialCombo,
  applyGravityAndRefill,
  findHintMove,
  GEM_COLORS,
  generateId,
  isCellBlocked,
} from './utils/jewelEngine';
import { sound } from './services/audio';
import { calculateAdRevenue, GOOGLE_ADMOB_TEST_UNITS } from './services/admobService';

// UI Components
import { TopHeader } from './components/TopHeader';
import { GameBoard } from './components/GameBoard';
import { PowerupBar } from './components/PowerupBar';
import { BottomBannerAd } from './components/BottomBannerAd';
import { WinModal } from './components/WinModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { AdMobDevModal } from './components/AdMobDevModal';
import { AdMobRewardedModal } from './components/AdMobRewardedModal';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';

export const App: React.FC = () => {
  // Level & Game State
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [board, setBoard] = useState<(Gem | null)[][]>(() => createInitialBoard(LEVELS[0]));
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(LEVELS[0].moves);
  const [remainingTargets, setRemainingTargets] = useState<Partial<Record<GemType, number>>>(LEVELS[0].targets);
  const [remainingIce, setRemainingIce] = useState<number>(LEVELS[0].iceTargets || 0);
  const [remainingStones, setRemainingStones] = useState<number>(LEVELS[0].stoneTargets || 0);
  const [coins, setCoins] = useState<number>(100);

  // Interaction State
  const [selectedGem, setSelectedGem] = useState<[number, number] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hintMove, setHintMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [swapBoosterFirstGem, setSwapBoosterFirstGem] = useState<[number, number] | null>(null);

  // Visual Effects State
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  // Inventory & Progress
  const [inventory, setInventory] = useState<PowerUpInventory>({
    hammer: 3,
    swap: 3,
    rainbow: 2,
    lightning: 2,
  });

  const [progressMap, setProgressMap] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem('jewel_crush_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      1: { levelId: 1, stars: 0, highScore: 0, unlocked: true },
    };
  });

  // Audio Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => sound.isBgmEnabled());
  const [sfxVolume, setSfxVolume] = useState<number>(() => sound.getSfxVolume());
  const [bgmVolume, setBgmVolume] = useState<number>(() => sound.getBgmVolume());

  // AdMob State
  const [adMobConfig, setAdMobConfig] = useState<AdMobConfig>({
    appId: GOOGLE_ADMOB_TEST_UNITS.APP_ID,
    bannerUnitId: GOOGLE_ADMOB_TEST_UNITS.BANNER,
    interstitialUnitId: GOOGLE_ADMOB_TEST_UNITS.INTERSTITIAL,
    rewardedUnitId: GOOGLE_ADMOB_TEST_UNITS.REWARDED,
    testMode: true,
    bannerPosition: 'bottom',
    isBannerVisible: true,
  });

  const [adMobStats, setAdMobStats] = useState<AdMobStats>({
    rewardedWatched: 0,
    interstitialsShown: 0,
    bannerImpressions: 0,
    estimatedEarningsUsd: 0,
  });

  // Modal Visibility
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdDevOpen, setIsAdDevOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState(false);
  const [rewardPurpose, setRewardPurpose] = useState<'moves' | 'powerups' | 'double_coins'>('moves');

  const idleTimerRef = useRef<number | null>(null);

  // Initialize Audio & BGM on first user interaction
  useEffect(() => {
    const handleFirstTouch = () => {
      if (bgmEnabled) {
        sound.startBgm();
      }
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };

    window.addEventListener('pointerdown', handleFirstTouch);
    window.addEventListener('keydown', handleFirstTouch);

    return () => {
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, [bgmEnabled]);

  // Clean expired laser beams & floating scores
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setLaserBeams(prev => prev.filter(b => now - b.createdAt < 450));
      setFloatingScores(prev => prev.filter(s => now - s.createdAt < 900));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Save Progress
  const saveLevelSuccess = useCallback((levelId: number, earnedStars: number, finalScore: number) => {
    setProgressMap(prev => {
      const currentEntry = prev[levelId] || { levelId, stars: 0, highScore: 0, unlocked: true };
      const updated: Record<number, LevelProgress> = {
        ...prev,
        [levelId]: {
          levelId,
          stars: Math.max(currentEntry.stars, earnedStars),
          highScore: Math.max(currentEntry.highScore, finalScore),
          unlocked: true,
        },
        [levelId + 1]: {
          levelId: levelId + 1,
          stars: prev[levelId + 1]?.stars || 0,
          highScore: prev[levelId + 1]?.highScore || 0,
          unlocked: true,
        },
      };
      try {
        localStorage.setItem('jewel_crush_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Reset Level Progress
  const handleResetProgress = () => {
    const fresh: Record<number, LevelProgress> = {
      1: { levelId: 1, stars: 0, highScore: 0, unlocked: true },
    };
    setProgressMap(fresh);
    localStorage.removeItem('jewel_crush_progress');
    loadLevel(LEVELS[0]);
  };

  // Load a Level
  const loadLevel = useCallback((lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    setBoard(createInitialBoard(lvl));
    setScore(0);
    setMovesLeft(lvl.moves);
    setRemainingTargets({ ...lvl.targets });
    setRemainingIce(lvl.iceTargets || 0);
    setRemainingStones(lvl.stoneTargets || 0);
    setSelectedGem(null);
    setIsProcessing(false);
    setHintMove(null);
    setActivePowerUp(null);
    setSwapBoosterFirstGem(null);
    setIsWinOpen(false);
    setIsGameOverOpen(false);
  }, []);

  // Idle Hint Timer
  const resetIdleTimer = useCallback(() => {
    setHintMove(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = window.setTimeout(() => {
      if (!isProcessing && !isWinOpen && !isGameOverOpen) {
        const hint = findHintMove(board, currentLevel);
        if (hint) {
          setHintMove(hint);
        }
      }
    }, 4500);
  }, [board, currentLevel, isProcessing, isWinOpen, isGameOverOpen]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Calculate Stars Earned
  const calculateStars = (currentScore: number): number => {
    const [s1, s2, s3] = currentLevel.starScores;
    if (currentScore >= s3) return 3;
    if (currentScore >= s2) return 2;
    if (currentScore >= s1) return 1;
    return 0;
  };

  const starsEarned = calculateStars(score);

  // Check Level Objectives Completion
  const checkWinConditions = (
    targets: Partial<Record<GemType, number>>,
    ice: number,
    stones: number
  ): boolean => {
    if (currentLevel.id === 999) return false; // Endless mode

    const allGemsDone = Object.values(targets).every(cnt => (cnt ?? 0) <= 0);
    const iceDone = ice <= 0;
    const stonesDone = stones <= 0;

    return allGemsDone && iceDone && stonesDone;
  };

  // Add Floating Score Effect
  const addFloatingScore = (xPct: number, yPct: number, text: string, color: string = '#fff', isBig: boolean = false) => {
    setFloatingScores(prev => [
      ...prev,
      {
        id: generateId(),
        x: xPct,
        y: yPct,
        text,
        color,
        isBig,
        createdAt: Date.now(),
      },
    ]);
  };

  // Process Cascade Iteration
  const processMatchesAndCascade = async (
    initialBoard: (Gem | null)[][],
    sourcePos?: [number, number],
    targetPos?: [number, number],
    specialOverrideResult?: any
  ) => {
    setIsProcessing(true);
    let curBoard = initialBoard;
    let combo = 1;
    let isFirstStep = true;

    let curTargets = { ...remainingTargets };
    let curIce = remainingIce;
    let curStones = remainingStones;
    let accumulatedScore = score;

    while (true) {
      // Find matches on board or use special combo result
      const matchResult = isFirstStep && specialOverrideResult
        ? specialOverrideResult
        : findMatches(curBoard, currentLevel, sourcePos, targetPos);

      isFirstStep = false;

      if (matchResult.matchedGems.length === 0) {
        break; // Board has stabilized
      }

      // Play match sounds & feedback
      sound.playMatch(combo);

      // Trigger Lasers
      if (matchResult.lasersTriggered.length > 0) {
        sound.playLaserBeam();
        setLaserBeams(prev => [...prev, ...matchResult.lasersTriggered]);
      }

      // Check if bomb was exploded
      if (matchResult.matchedGems.some((g: Gem) => g.special === 'bomb')) {
        sound.playBombExplode();
      }

      // Check if ice shattered
      if (matchResult.clearedIce.length > 0) {
        sound.playIceShatter();
        curIce = Math.max(0, curIce - matchResult.clearedIce.length);
        setRemainingIce(curIce);
      }

      // Check if stone cracked
      if (matchResult.clearedStones.length > 0) {
        sound.playStoneCrack();
        curStones = Math.max(0, curStones - matchResult.clearedStones.length);
        setRemainingStones(curStones);
      }

      // Update Target Jewel counts
      Object.entries(matchResult.clearedByType).forEach(([gemTypeKey, count]) => {
        const gemType = gemTypeKey as GemType;
        const countNum = typeof count === 'number' ? count : 0;
        if (curTargets[gemType] !== undefined && countNum > 0) {
          curTargets[gemType] = Math.max(0, (curTargets[gemType] || 0) - countNum);
        }
      });
      setRemainingTargets({ ...curTargets });

      // Score additions with combo multiplier
      const stepScore = matchResult.totalScore * combo;
      accumulatedScore += stepScore;
      setScore(accumulatedScore);

      // Floating Score Popups
      if (matchResult.matchedGems.length > 0) {
        const centerGem = matchResult.matchedGems[Math.floor(matchResult.matchedGems.length / 2)];
        const xPct = (centerGem.col / currentLevel.boardCols) * 100 + 50 / currentLevel.boardCols;
        const yPct = (centerGem.row / currentLevel.boardRows) * 100 + 50 / currentLevel.boardRows;
        const scoreText = combo > 1 ? `+${stepScore} (x${combo})` : `+${stepScore}`;
        addFloatingScore(xPct, yPct, scoreText, GEM_COLORS[centerGem.type] || '#fde047', combo > 1);
      }

      // Remove matched gems from board and insert newly created specials
      const tempBoard = curBoard.map(row => [...row]);
      for (const g of matchResult.matchedGems) {
        tempBoard[g.row][g.col] = null;
      }

      for (const s of matchResult.createdSpecials) {
        tempBoard[s.row][s.col] = {
          id: generateId(),
          type: s.type,
          special: s.special,
          row: s.row,
          col: s.col,
          obstacle: 'none',
        };
        sound.playStarDing(1);
      }

      setBoard(tempBoard);
      await new Promise(r => setTimeout(r, 220));

      // Apply Gravity & Drop Gems
      const refilledBoard = applyGravityAndRefill(tempBoard, currentLevel);
      curBoard = refilledBoard;
      setBoard(refilledBoard);

      combo++;
      await new Promise(r => setTimeout(r, 240));
    }

    setIsProcessing(false);

    // Check Win or Fail Condition
    const isWon = checkWinConditions(curTargets, curIce, curStones);
    if (isWon) {
      const finalStars = calculateStars(accumulatedScore);
      saveLevelSuccess(currentLevel.id, finalStars, accumulatedScore);
      setCoins(prev => prev + 50);
      setIsWinOpen(true);
    } else if (movesLeft <= 1 && currentLevel.id !== 999) {
      // Out of Moves
      setIsGameOverOpen(true);
    }
  };

  // Perform a Swap
  const handleSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing) return;

    const g1 = board[r1]?.[c1];
    const g2 = board[r2]?.[c2];
    if (!g1 || !g2 || g1.obstacle === 'stone' || g2.obstacle === 'stone') return;

    sound.playSwap();
    setSelectedGem(null);
    setHintMove(null);

    // 1. Check for Special Combo (e.g. Rainbow + Striped, Bomb + Bomb, etc.)
    const specialComboResult = handleSpecialCombo(board, currentLevel, g1, g2);
    if (specialComboResult) {
      setMovesLeft(prev => Math.max(0, prev - 1));
      await processMatchesAndCascade(board, [r1, c1], [r2, c2], specialComboResult);
      return;
    }

    // 2. Perform normal swap
    const swappedBoard = board.map(row => [...row]);
    swappedBoard[r1][c1] = { ...g2, row: r1, col: c1 };
    swappedBoard[r2][c2] = { ...g1, row: r2, col: c2 };
    setBoard(swappedBoard);

    // Verify if valid match was made
    const matchCheck = findMatches(swappedBoard, currentLevel, [r1, c1], [r2, c2]);

    if (matchCheck.matchedGems.length > 0) {
      // Valid move!
      setMovesLeft(prev => Math.max(0, prev - 1));
      await processMatchesAndCascade(swappedBoard, [r1, c1], [r2, c2]);
    } else {
      // Invalid move -> animate revert swap
      await new Promise(r => setTimeout(r, 200));
      setBoard(board);
    }
  };

  // Handle Board Cell Click
  const handleCellClick = (r: number, c: number) => {
    if (isProcessing) return;

    const gem = board[r]?.[c];
    if (!gem || isCellBlocked(currentLevel, r, c)) return;

    // Handle Active PowerUp Action
    if (activePowerUp) {
      handleUsePowerUp(activePowerUp, r, c);
      return;
    }

    if (gem.obstacle === 'stone') return;

    sound.playButton();

    if (!selectedGem) {
      setSelectedGem([r, c]);
    } else {
      const [sr, sc] = selectedGem;
      if (sr === r && sc === c) {
        setSelectedGem(null);
        return;
      }

      // Check if adjacent
      const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
      if (isAdjacent) {
        handleSwap(sr, sc, r, c);
      } else {
        setSelectedGem([r, c]);
      }
    }
  };

  // Handle In-Game Powerups
  const handleUsePowerUp = async (type: PowerUpType, r: number, c: number) => {
    sound.playPowerup();

    if (type === 'hammer') {
      // Smash single cell
      setInventory(prev => ({ ...prev, hammer: Math.max(0, prev.hammer - 1) }));
      setActivePowerUp(null);

      const targetGem = board[r][c];
      if (!targetGem) return;

      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = null;
      setBoard(newBoard);

      addFloatingScore(
        (c / currentLevel.boardCols) * 100 + 50 / currentLevel.boardCols,
        (r / currentLevel.boardRows) * 100 + 50 / currentLevel.boardRows,
        'SMASH! +100',
        '#f59e0b',
        true
      );

      const refilled = applyGravityAndRefill(newBoard, currentLevel);
      setBoard(refilled);
      processMatchesAndCascade(refilled);
    } else if (type === 'swap') {
      // Free swap two jewels anywhere
      if (!swapBoosterFirstGem) {
        setSwapBoosterFirstGem([r, c]);
        setSelectedGem([r, c]);
      } else {
        const [r1, c1] = swapBoosterFirstGem;
        setInventory(prev => ({ ...prev, swap: Math.max(0, prev.swap - 1) }));
        setActivePowerUp(null);
        setSwapBoosterFirstGem(null);
        setSelectedGem(null);

        const g1 = board[r1][c1];
        const g2 = board[r][c];
        if (g1 && g2) {
          const swapped = board.map(row => [...row]);
          swapped[r1][c1] = { ...g2, row: r1, col: c1 };
          swapped[r][c] = { ...g1, row: r, col: c };
          setBoard(swapped);
          processMatchesAndCascade(swapped);
        }
      }
    } else if (type === 'rainbow') {
      // Spawn Rainbow Bomb
      setInventory(prev => ({ ...prev, rainbow: Math.max(0, prev.rainbow - 1) }));
      setActivePowerUp(null);

      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = {
        id: generateId(),
        type: board[r][c]?.type || 'ruby',
        special: 'rainbow',
        row: r,
        col: c,
        obstacle: 'none',
      };
      setBoard(newBoard);
      sound.playStarDing(3);
    } else if (type === 'lightning') {
      // Zap Row & Col
      setInventory(prev => ({ ...prev, lightning: Math.max(0, prev.lightning - 1) }));
      setActivePowerUp(null);

      sound.playLaserBeam();
      setLaserBeams(prev => [
        ...prev,
        { id: generateId(), direction: 'row', index: r, color: '#38bdf8', createdAt: Date.now() },
        { id: generateId(), direction: 'col', index: c, color: '#38bdf8', createdAt: Date.now() },
      ]);

      const newBoard = board.map(row => [...row]);
      for (let sc = 0; sc < currentLevel.boardCols; sc++) newBoard[r][sc] = null;
      for (let sr = 0; sr < currentLevel.boardRows; sr++) newBoard[sr][c] = null;

      setBoard(newBoard);
      const refilled = applyGravityAndRefill(newBoard, currentLevel);
      setBoard(refilled);
      processMatchesAndCascade(refilled);
    }
  };

  // Rewarded Ad Triggers
  const handleWatchRewardedForMoves = () => {
    setRewardPurpose('moves');
    setIsGameOverOpen(false);
    setIsRewardedAdOpen(true);
  };

  const handleWatchRewardedForPowerups = () => {
    setRewardPurpose('powerups');
    setIsRewardedAdOpen(true);
  };

  const handleWatchDoubleReward = () => {
    setRewardPurpose('double_coins');
    setIsRewardedAdOpen(true);
  };

  // Handle Reward Granted
  const handleRewardGranted = () => {
    const rev = calculateAdRevenue('rewarded');
    setAdMobStats(prev => ({
      ...prev,
      rewardedWatched: prev.rewardedWatched + 1,
      estimatedEarningsUsd: prev.estimatedEarningsUsd + rev,
    }));

    if (rewardPurpose === 'moves') {
      setMovesLeft(prev => prev + 5);
      setIsGameOverOpen(false);
    } else if (rewardPurpose === 'powerups') {
      setInventory(prev => ({
        hammer: prev.hammer + 1,
        swap: prev.swap + 1,
        rainbow: prev.rainbow + 1,
        lightning: prev.lightning + 1,
      }));
    } else if (rewardPurpose === 'double_coins') {
      setCoins(prev => prev + 100);
    }
  };

  // Handle Next Level (Shows Interstitial ad occasionally like real mobile games!)
  const handleNextLevel = () => {
    const nextId = currentLevel.id + 1;
    const nextLevel = LEVELS.find(l => l.id === nextId) || LEVELS[0];

    // Trigger Interstitial ad every 2 levels
    if (nextId % 2 === 0) {
      const rev = calculateAdRevenue('interstitial');
      setAdMobStats(prev => ({
        ...prev,
        interstitialsShown: prev.interstitialsShown + 1,
        estimatedEarningsUsd: prev.estimatedEarningsUsd + rev,
      }));
      setIsInterstitialAdOpen(true);
    }

    loadLevel(nextLevel);
  };

  return (
    <div className="min-h-screen bg-[#180b05] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#451d08] via-[#240e04] to-[#120602] text-white flex flex-col items-center justify-between p-2 sm:p-4">
      {/* Container Frame */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center flex-1 justify-between">
        {/* TOP SCORE & OBJECTIVES HEADER */}
        <TopHeader
          level={currentLevel}
          score={score}
          movesLeft={movesLeft}
          remainingTargets={remainingTargets}
          remainingIce={remainingIce}
          remainingStones={remainingStones}
          starsEarned={starsEarned}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLevels={() => setIsLevelSelectOpen(true)}
          onRestartLevel={() => loadLevel(currentLevel)}
          onOpenAdDev={() => setIsAdDevOpen(true)}
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          onToggleSound={() => setSoundEnabled(sound.toggleSfx())}
          onToggleBgm={() => setBgmEnabled(sound.toggleBgm())}
        />

        {/* MATCH-3 GAME BOARD */}
        <GameBoard
          board={board}
          level={currentLevel}
          selectedGem={selectedGem}
          hintMove={hintMove}
          laserBeams={laserBeams}
          floatingScores={floatingScores}
          activePowerUp={activePowerUp}
          onCellClick={handleCellClick}
          onSwap={handleSwap}
        />

        {/* IN-GAME POWERUP BOOSTERS */}
        <PowerupBar
          inventory={inventory}
          activePowerUp={activePowerUp}
          onSelectPowerUp={(type) => {
            if (activePowerUp === type) {
              setActivePowerUp(null);
              setSwapBoosterFirstGem(null);
            } else {
              setActivePowerUp(type);
            }
          }}
          onWatchRewardedForPowerups={handleWatchRewardedForPowerups}
        />

        {/* BOTTOM ADMOB TEST BANNER & UNLIMITED PLAY BAR */}
        <BottomBannerAd
          config={adMobConfig}
          stats={adMobStats}
          onAdImpression={(rev) => {
            setAdMobStats(prev => ({
              ...prev,
              bannerImpressions: prev.bannerImpressions + 1,
              estimatedEarningsUsd: prev.estimatedEarningsUsd + rev,
            }));
          }}
          onOpenAdInspector={() => setIsAdDevOpen(true)}
        />
      </div>

      {/* MODALS */}
      {isWinOpen && (
        <WinModal
          level={currentLevel}
          score={score}
          movesLeft={movesLeft}
          starsEarned={starsEarned}
          coinsEarned={50}
          onNextLevel={handleNextLevel}
          onReplay={() => loadLevel(currentLevel)}
          onWatchDoubleReward={handleWatchDoubleReward}
        />
      )}

      {isGameOverOpen && (
        <GameOverModal
          level={currentLevel}
          score={score}
          onRestart={() => loadLevel(currentLevel)}
          onWatchAdForMoves={handleWatchRewardedForMoves}
        />
      )}

      {isLevelSelectOpen && (
        <LevelSelectModal
          currentLevelId={currentLevel.id}
          progressMap={progressMap}
          totalStars={Object.values(progressMap).reduce((acc: number, p: LevelProgress) => acc + (p?.stars || 0), 0)}
          onSelectLevel={(lvl) => loadLevel(lvl)}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          sfxVolume={sfxVolume}
          bgmVolume={bgmVolume}
          onToggleSound={() => setSoundEnabled(sound.toggleSfx())}
          onToggleBgm={() => setBgmEnabled(sound.toggleBgm())}
          onChangeSfxVolume={(vol) => {
            setSfxVolume(vol);
            sound.setSfxVolume(vol);
          }}
          onChangeBgmVolume={(vol) => {
            setBgmVolume(vol);
            sound.setBgmVolume(vol);
          }}
          onResetProgress={handleResetProgress}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isAdDevOpen && (
        <AdMobDevModal
          config={adMobConfig}
          stats={adMobStats}
          onClose={() => setIsAdDevOpen(false)}
          onTriggerRewarded={() => {
            setIsAdDevOpen(false);
            handleWatchRewardedForPowerups();
          }}
          onTriggerInterstitial={() => {
            setIsAdDevOpen(false);
            const rev = calculateAdRevenue('interstitial');
            setAdMobStats(prev => ({
              ...prev,
              interstitialsShown: prev.interstitialsShown + 1,
              estimatedEarningsUsd: prev.estimatedEarningsUsd + rev,
            }));
            setIsInterstitialAdOpen(true);
          }}
          onToggleBanner={() => {
            setAdMobConfig(prev => ({ ...prev, isBannerVisible: !prev.isBannerVisible }));
          }}
        />
      )}

      {isRewardedAdOpen && (
        <AdMobRewardedModal
          rewardTitle={
            rewardPurpose === 'moves'
              ? '+5 Extra Moves'
              : rewardPurpose === 'powerups'
              ? '+1 of Every Booster'
              : '2x Level Coins'
          }
          onRewardEarned={handleRewardGranted}
          onClose={() => setIsRewardedAdOpen(false)}
        />
      )}

      {isInterstitialAdOpen && (
        <AdMobInterstitialModal onClose={() => setIsInterstitialAdOpen(false)} />
      )}
    </div>
  );
};

export default App;
