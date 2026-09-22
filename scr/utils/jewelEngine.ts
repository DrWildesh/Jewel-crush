import { Gem, GemType, SpecialType, LevelConfig, LaserBeam } from '../types';

export const GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'topaz', 'emerald', 'amethyst', 'amber'];

export const GEM_COLORS: Record<GemType, string> = {
  ruby: '#ef4444',      // Vibrant Red
  sapphire: '#3b82f6',  // Brilliant Royal Blue
  topaz: '#eab308',     // Sparkling Golden Yellow
  emerald: '#22c55e',   // Radiant Emerald Green
  amethyst: '#a855f7',  // Deep Amethyst Purple
  amber: '#f97316',     // Warm Fiery Amber
};

export const GEM_DISPLAY_NAMES: Record<GemType, string> = {
  ruby: 'Ruby',
  sapphire: 'Sapphire',
  topaz: 'Topaz',
  emerald: 'Emerald',
  amethyst: 'Amethyst',
  amber: 'Amber',
};

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Check if a cell is blocked in this level
export function isCellBlocked(level: LevelConfig, row: number, col: number): boolean {
  if (row < 0 || row >= level.boardRows || col < 0 || col >= level.boardCols) return true;
  if (!level.blockedCells) return false;
  return level.blockedCells.some(([r, c]) => r === row && c === col);
}

// Create initial game board without immediate 3-matches
export function createInitialBoard(level: LevelConfig): (Gem | null)[][] {
  const board: (Gem | null)[][] = [];

  for (let r = 0; r < level.boardRows; r++) {
    board[r] = [];
    for (let c = 0; c < level.boardCols; c++) {
      if (isCellBlocked(level, r, c)) {
        board[r][c] = null;
        continue;
      }

      // Find initial obstacle
      const hasIce = level.initialIce?.some(([ir, ic]) => ir === r && ic === c);
      const hasStone = level.initialStones?.some(([sr, sc]) => sr === r && sc === c);

      let availableTypes = [...GEM_TYPES];

      // Avoid horizontal 3-matches
      if (c >= 2 && board[r][c - 1] && board[r][c - 2]) {
        const t1 = board[r][c - 1]?.type;
        const t2 = board[r][c - 2]?.type;
        if (t1 === t2) {
          availableTypes = availableTypes.filter(t => t !== t1);
        }
      }

      // Avoid vertical 3-matches
      if (r >= 2 && board[r - 1][c] && board[r - 2][c]) {
        const t1 = board[r - 1][c]?.type;
        const t2 = board[r - 2][c]?.type;
        if (t1 === t2) {
          availableTypes = availableTypes.filter(t => t !== t1);
        }
      }

      const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || GEM_TYPES[0];

      board[r][c] = {
        id: generateId(),
        type: selectedType,
        special: 'normal',
        row: r,
        col: c,
        obstacle: hasStone ? 'stone' : hasIce ? 'ice' : 'none',
        iceHealth: hasIce ? 1 : 0,
        stoneHealth: hasStone ? 1 : 0,
      };
    }
  }

  return board;
}

export interface MatchResult {
  matchedGems: Gem[];
  createdSpecials: { row: number; col: number; type: GemType; special: SpecialType }[];
  clearedIce: [number, number][];
  clearedStones: [number, number][];
  lasersTriggered: LaserBeam[];
  totalScore: number;
  clearedByType: Partial<Record<GemType, number>>;
}

// Find all matches on board
export function findMatches(
  board: (Gem | null)[][],
  level: LevelConfig,
  swapSource?: [number, number],
  swapTarget?: [number, number]
): MatchResult {
  const rows = level.boardRows;
  const cols = level.boardCols;

  const matchedSet = new Set<string>();
  const horizontalRuns: { row: number; startCol: number; endCol: number; type: GemType; count: number }[] = [];
  const verticalRuns: { col: number; startRow: number; endRow: number; type: GemType; count: number }[] = [];

  // Check Horizontal Runs
  for (let r = 0; r < rows; r++) {
    let matchCount = 1;
    for (let c = 0; c < cols; c++) {
      const current = board[r][c];
      const next = c + 1 < cols ? board[r][c + 1] : null;

      if (current && next && current.type === next.type && current.obstacle !== 'stone' && next.obstacle !== 'stone') {
        matchCount++;
      } else {
        if (matchCount >= 3 && current) {
          horizontalRuns.push({
            row: r,
            startCol: c - matchCount + 1,
            endCol: c,
            type: current.type,
            count: matchCount,
          });
          for (let colIdx = c - matchCount + 1; colIdx <= c; colIdx++) {
            const g = board[r][colIdx];
            if (g) matchedSet.add(g.id);
          }
        }
        matchCount = 1;
      }
    }
  }

  // Check Vertical Runs
  for (let c = 0; c < cols; c++) {
    let matchCount = 1;
    for (let r = 0; r < rows; r++) {
      const current = board[r][c];
      const next = r + 1 < rows ? board[r + 1][c] : null;

      if (current && next && current.type === next.type && current.obstacle !== 'stone' && next.obstacle !== 'stone') {
        matchCount++;
      } else {
        if (matchCount >= 3 && current) {
          verticalRuns.push({
            col: c,
            startRow: r - matchCount + 1,
            endRow: r,
            type: current.type,
            count: matchCount,
          });
          for (let rowIdx = r - matchCount + 1; rowIdx <= r; rowIdx++) {
            const g = board[rowIdx][c];
            if (g) matchedSet.add(g.id);
          }
        }
        matchCount = 1;
      }
    }
  }

  if (matchedSet.size === 0) {
    return {
      matchedGems: [],
      createdSpecials: [],
      clearedIce: [],
      clearedStones: [],
      lasersTriggered: [],
      totalScore: 0,
      clearedByType: {},
    };
  }

  // Determine Special Gem Creations
  const createdSpecials: { row: number; col: number; type: GemType; special: SpecialType }[] = [];
  const handledSpecialCells = new Set<string>();

  // Helper to pick origin coordinate for special gem
  const pickSpecialCoord = (r1: number, c1: number, r2: number, c2: number): [number, number] => {
    if (swapTarget && swapTarget[0] >= r1 && swapTarget[0] <= r2 && swapTarget[1] >= c1 && swapTarget[1] <= c2) {
      return swapTarget;
    }
    if (swapSource && swapSource[0] >= r1 && swapSource[0] <= r2 && swapSource[1] >= c1 && swapSource[1] <= c2) {
      return swapSource;
    }
    return [Math.floor((r1 + r2) / 2), Math.floor((c1 + c2) / 2)];
  };

  // 1. Check for T or L shapes (Bomb gem)
  for (const h of horizontalRuns) {
    for (const v of verticalRuns) {
      if (h.type === v.type && v.col >= h.startCol && v.col <= h.endCol && h.row >= v.startRow && h.row <= v.endRow) {
        const key = `${h.row},${v.col}`;
        if (!handledSpecialCells.has(key)) {
          handledSpecialCells.add(key);
          createdSpecials.push({
            row: h.row,
            col: v.col,
            type: h.type,
            special: 'bomb',
          });
        }
      }
    }
  }

  // 2. Check 5-in-a-line (Rainbow color bomb)
  for (const h of horizontalRuns) {
    if (h.count >= 5) {
      const [sr, sc] = pickSpecialCoord(h.row, h.startCol, h.row, h.endCol);
      const key = `${sr},${sc}`;
      if (!handledSpecialCells.has(key)) {
        handledSpecialCells.add(key);
        createdSpecials.push({
          row: sr,
          col: sc,
          type: h.type,
          special: 'rainbow',
        });
      }
    }
  }
  for (const v of verticalRuns) {
    if (v.count >= 5) {
      const [sr, sc] = pickSpecialCoord(v.startRow, v.col, v.endRow, v.col);
      const key = `${sr},${sc}`;
      if (!handledSpecialCells.has(key)) {
        handledSpecialCells.add(key);
        createdSpecials.push({
          row: sr,
          col: sc,
          type: v.type,
          special: 'rainbow',
        });
      }
    }
  }

  // 3. Check 4-in-a-line (Striped laser gem)
  for (const h of horizontalRuns) {
    if (h.count === 4) {
      const [sr, sc] = pickSpecialCoord(h.row, h.startCol, h.row, h.endCol);
      const key = `${sr},${sc}`;
      if (!handledSpecialCells.has(key)) {
        handledSpecialCells.add(key);
        createdSpecials.push({
          row: sr,
          col: sc,
          type: h.type,
          special: 'striped_v', // Horizontal match creates vertical laser
        });
      }
    }
  }
  for (const v of verticalRuns) {
    if (v.count === 4) {
      const [sr, sc] = pickSpecialCoord(v.startRow, v.col, v.endRow, v.col);
      const key = `${sr},${sc}`;
      if (!handledSpecialCells.has(key)) {
        handledSpecialCells.add(key);
        createdSpecials.push({
          row: sr,
          col: sc,
          type: v.type,
          special: 'striped_h', // Vertical match creates horizontal laser
        });
      }
    }
  }

  // Find all gems to destroy, including secondary triggers from existing special gems!
  const destroyedGemsMap = new Map<string, Gem>();
  const lasersTriggered: LaserBeam[] = [];
  const queueToTrigger: Gem[] = [];

  // Initial matched gems
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const g = board[r][c];
      if (g && matchedSet.has(g.id)) {
        destroyedGemsMap.set(g.id, g);
        if (g.special !== 'normal') {
          queueToTrigger.push(g);
        }
      }
    }
  }

  // Process triggers (cascading explosions and lasers)
  const processedTriggers = new Set<string>();
  while (queueToTrigger.length > 0) {
    const specialGem = queueToTrigger.shift()!;
    if (processedTriggers.has(specialGem.id)) continue;
    processedTriggers.add(specialGem.id);

    if (specialGem.special === 'striped_h') {
      // Clear entire row
      lasersTriggered.push({
        id: generateId(),
        direction: 'row',
        index: specialGem.row,
        color: GEM_COLORS[specialGem.type],
        createdAt: Date.now(),
      });
      for (let c = 0; c < cols; c++) {
        const target = board[specialGem.row][c];
        if (target && !destroyedGemsMap.has(target.id) && target.obstacle !== 'stone') {
          destroyedGemsMap.set(target.id, target);
          if (target.special !== 'normal') queueToTrigger.push(target);
        }
      }
    } else if (specialGem.special === 'striped_v') {
      // Clear entire col
      lasersTriggered.push({
        id: generateId(),
        direction: 'col',
        index: specialGem.col,
        color: GEM_COLORS[specialGem.type],
        createdAt: Date.now(),
      });
      for (let r = 0; r < rows; r++) {
        const target = board[r][specialGem.col];
        if (target && !destroyedGemsMap.has(target.id) && target.obstacle !== 'stone') {
          destroyedGemsMap.set(target.id, target);
          if (target.special !== 'normal') queueToTrigger.push(target);
        }
      }
    } else if (specialGem.special === 'bomb') {
      // 3x3 Explosion
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = specialGem.row + dr;
          const nc = specialGem.col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const target = board[nr][nc];
            if (target && !destroyedGemsMap.has(target.id) && target.obstacle !== 'stone') {
              destroyedGemsMap.set(target.id, target);
              if (target.special !== 'normal') queueToTrigger.push(target);
            }
          }
        }
      }
    }
  }

  // Handle Obstacles: Ice and Stone breaking
  const clearedIce: [number, number][] = [];
  const clearedStones: [number, number][] = [];

  const matchedPositions = Array.from(destroyedGemsMap.values()).map(g => [g.row, g.col]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const g = board[r][c];
      if (!g) continue;

      // Shatter ice if jewel on it is matched
      if (g.obstacle === 'ice' && destroyedGemsMap.has(g.id)) {
        clearedIce.push([r, c]);
      }

      // Break stone if adjacent to any destroyed gem
      if (g.obstacle === 'stone') {
        const isAdjacent = matchedPositions.some(([mr, mc]) => 
          (Math.abs(mr - r) === 1 && mc === c) || (Math.abs(mc - c) === 1 && mr === r)
        );
        if (isAdjacent) {
          clearedStones.push([r, c]);
        }
      }
    }
  }

  // Calculate score and counts
  const clearedByType: Partial<Record<GemType, number>> = {};
  let totalScore = 0;

  for (const g of destroyedGemsMap.values()) {
    clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
    totalScore += 20; // 20 pts per gem
  }

  // Extra points for ice, stone, and specials
  totalScore += clearedIce.length * 50;
  totalScore += clearedStones.length * 100;
  totalScore += createdSpecials.length * 150;

  return {
    matchedGems: Array.from(destroyedGemsMap.values()),
    createdSpecials,
    clearedIce,
    clearedStones,
    lasersTriggered,
    totalScore,
    clearedByType,
  };
}

// Special-to-Special Combo Swap Handler
export function handleSpecialCombo(
  board: (Gem | null)[][],
  level: LevelConfig,
  gemA: Gem,
  gemB: Gem
): MatchResult | null {
  const rows = level.boardRows;
  const cols = level.boardCols;

  // 1. Rainbow + Rainbow: Clear entire board!
  if (gemA.special === 'rainbow' && gemB.special === 'rainbow') {
    const destroyed: Gem[] = [];
    const clearedIce: [number, number][] = [];
    const clearedStones: [number, number][] = [];
    const clearedByType: Partial<Record<GemType, number>> = {};

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const g = board[r][c];
        if (g) {
          destroyed.push(g);
          clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
          if (g.obstacle === 'ice') clearedIce.push([r, c]);
          if (g.obstacle === 'stone') clearedStones.push([r, c]);
        }
      }
    }

    return {
      matchedGems: destroyed,
      createdSpecials: [],
      clearedIce,
      clearedStones,
      lasersTriggered: [],
      totalScore: 5000,
      clearedByType,
    };
  }

  // 2. Rainbow + (Normal or Striped or Bomb)
  if (gemA.special === 'rainbow' || gemB.special === 'rainbow') {
    const rainbowGem = gemA.special === 'rainbow' ? gemA : gemB;
    const otherGem = gemA.special === 'rainbow' ? gemB : gemA;
    const targetType = otherGem.type;

    const destroyed: Gem[] = [rainbowGem];
    const lasersTriggered: LaserBeam[] = [];
    const clearedByType: Partial<Record<GemType, number>> = { [targetType]: 0 };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const g = board[r][c];
        if (g && g.type === targetType && g.obstacle !== 'stone') {
          destroyed.push(g);
          clearedByType[targetType] = (clearedByType[targetType] || 0) + 1;

          if (otherGem.special === 'striped_h' || otherGem.special === 'striped_v') {
            // Trigger random directional laser on each!
            const dir: 'row' | 'col' = Math.random() > 0.5 ? 'row' : 'col';
            lasersTriggered.push({
              id: generateId(),
              direction: dir,
              index: dir === 'row' ? r : c,
              color: GEM_COLORS[targetType],
              createdAt: Date.now(),
            });
            // Also destroy that line
            if (dir === 'row') {
              for (let sc = 0; sc < cols; sc++) {
                const tg = board[r][sc];
                if (tg && !destroyed.some(d => d.id === tg.id)) destroyed.push(tg);
              }
            } else {
              for (let sr = 0; sr < rows; sr++) {
                const tg = board[sr][c];
                if (tg && !destroyed.some(d => d.id === tg.id)) destroyed.push(tg);
              }
            }
          } else if (otherGem.special === 'bomb') {
            // 3x3 blast around each target gem!
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  const tg = board[nr][nc];
                  if (tg && !destroyed.some(d => d.id === tg.id)) destroyed.push(tg);
                }
              }
            }
          }
        }
      }
    }

    return {
      matchedGems: destroyed,
      createdSpecials: [],
      clearedIce: [],
      clearedStones: [],
      lasersTriggered,
      totalScore: destroyed.length * 50 + 500,
      clearedByType,
    };
  }

  // 3. Striped + Striped: Cross Laser (both row AND column!)
  if (
    (gemA.special === 'striped_h' || gemA.special === 'striped_v') &&
    (gemB.special === 'striped_h' || gemB.special === 'striped_v')
  ) {
    const centerRow = gemB.row;
    const centerCol = gemB.col;
    const destroyed: Gem[] = [];
    const clearedByType: Partial<Record<GemType, number>> = {};

    for (let c = 0; c < cols; c++) {
      const g = board[centerRow][c];
      if (g) {
        destroyed.push(g);
        clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
      }
    }
    for (let r = 0; r < rows; r++) {
      const g = board[r][centerCol];
      if (g && !destroyed.some(d => d.id === g.id)) {
        destroyed.push(g);
        clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
      }
    }

    return {
      matchedGems: destroyed,
      createdSpecials: [],
      clearedIce: [],
      clearedStones: [],
      lasersTriggered: [
        { id: generateId(), direction: 'row', index: centerRow, color: '#fbbf24', createdAt: Date.now() },
        { id: generateId(), direction: 'col', index: centerCol, color: '#fbbf24', createdAt: Date.now() },
      ],
      totalScore: 800,
      clearedByType,
    };
  }

  // 4. Bomb + Bomb: Giant 5x5 explosion!
  if (gemA.special === 'bomb' && gemB.special === 'bomb') {
    const cr = gemB.row;
    const cc = gemB.col;
    const destroyed: Gem[] = [];
    const clearedByType: Partial<Record<GemType, number>> = {};

    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const g = board[nr][nc];
          if (g) {
            destroyed.push(g);
            clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
          }
        }
      }
    }

    return {
      matchedGems: destroyed,
      createdSpecials: [],
      clearedIce: [],
      clearedStones: [],
      lasersTriggered: [],
      totalScore: 1200,
      clearedByType,
    };
  }

  // 5. Bomb + Striped: 3 Rows and 3 Columns Mega Laser Blast!
  if (
    (gemA.special === 'bomb' && (gemB.special === 'striped_h' || gemB.special === 'striped_v')) ||
    (gemB.special === 'bomb' && (gemA.special === 'striped_h' || gemA.special === 'striped_v'))
  ) {
    const cr = gemB.row;
    const cc = gemB.col;
    const destroyed: Gem[] = [];
    const lasersTriggered: LaserBeam[] = [];
    const clearedByType: Partial<Record<GemType, number>> = {};

    for (let dr = -1; dr <= 1; dr++) {
      const r = cr + dr;
      if (r >= 0 && r < rows) {
        lasersTriggered.push({ id: generateId(), direction: 'row', index: r, color: '#f59e0b', createdAt: Date.now() });
        for (let c = 0; c < cols; c++) {
          const g = board[r][c];
          if (g && !destroyed.some(d => d.id === g.id)) {
            destroyed.push(g);
            clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
          }
        }
      }
    }

    for (let dc = -1; dc <= 1; dc++) {
      const c = cc + dc;
      if (c >= 0 && c < cols) {
        lasersTriggered.push({ id: generateId(), direction: 'col', index: c, color: '#f59e0b', createdAt: Date.now() });
        for (let r = 0; r < rows; r++) {
          const g = board[r][c];
          if (g && !destroyed.some(d => d.id === g.id)) {
            destroyed.push(g);
            clearedByType[g.type] = (clearedByType[g.type] || 0) + 1;
          }
        }
      }
    }

    return {
      matchedGems: destroyed,
      createdSpecials: [],
      clearedIce: [],
      clearedStones: [],
      lasersTriggered,
      totalScore: 1500,
      clearedByType,
    };
  }

  return null;
}

// Apply Gravity & Spawn new gems to fill empty spaces
export function applyGravityAndRefill(
  board: (Gem | null)[][],
  level: LevelConfig
): (Gem | null)[][] {
  const rows = level.boardRows;
  const cols = level.boardCols;
  const newBoard: (Gem | null)[][] = board.map(r => [...r]);

  // For each column, drop existing gems down into empty non-blocked non-stone spaces
  for (let c = 0; c < cols; c++) {
    let emptyRow = rows - 1;

    for (let r = rows - 1; r >= 0; r--) {
      if (isCellBlocked(level, r, c)) {
        emptyRow = r - 1;
        continue;
      }

      const gem = newBoard[r][c];
      if (gem && gem.obstacle === 'stone') {
        emptyRow = r - 1;
        continue;
      }

      if (gem !== null) {
        if (r !== emptyRow) {
          newBoard[emptyRow][c] = {
            ...gem,
            row: emptyRow,
            col: c,
          };
          newBoard[r][c] = null;
        }
        emptyRow--;
      }
    }

    // Spawn new gems for remaining empty non-blocked non-stone slots
    for (let r = emptyRow; r >= 0; r--) {
      if (!isCellBlocked(level, r, c)) {
        const randomType = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
        newBoard[r][c] = {
          id: generateId(),
          type: randomType,
          special: 'normal',
          row: r,
          col: c,
          isNew: true,
          obstacle: 'none',
        };
      }
    }
  }

  return newBoard;
}

// Find a valid hint move (swap that results in a match)
export function findHintMove(
  board: (Gem | null)[][],
  level: LevelConfig
): { from: [number, number]; to: [number, number] } | null {
  const rows = level.boardRows;
  const cols = level.boardCols;

  const directions = [
    [0, 1],  // right
    [1, 0],  // down
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const g1 = board[r][c];
      if (!g1 || g1.obstacle === 'stone') continue;

      // Special combos are always valid moves!
      if (g1.special === 'rainbow') {
        if (c + 1 < cols && board[r][c + 1]) return { from: [r, c], to: [r, c + 1] };
        if (r + 1 < rows && board[r + 1][c]) return { from: [r, c], to: [r + 1, c] };
      }

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < rows && nc < cols) {
          const g2 = board[nr][nc];
          if (!g2 || g2.obstacle === 'stone') continue;

          // Swap gems temporarily
          const tempBoard = board.map(row => [...row]);
          tempBoard[r][c] = { ...g2, row: r, col: c };
          tempBoard[nr][nc] = { ...g1, row: nr, col: nc };

          // Check if match exists
          const result = findMatches(tempBoard, level, [r, c], [nr, nc]);
          if (result.matchedGems.length > 0) {
            return { from: [r, c], to: [nr, nc] };
          }
        }
      }
    }
  }

  return null;
}
