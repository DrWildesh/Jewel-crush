// Web Audio API Sound and BGM Synthesizer for Jewel Crush Classic

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.35;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  // BGM Sequencing state
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentBeat: number = 0;

  constructor() {
    // Load persisted preferences if available
    try {
      const savedSfx = localStorage.getItem('jewel_crush_sfx');
      const savedBgm = localStorage.getItem('jewel_crush_bgm');
      const savedBgmVol = localStorage.getItem('jewel_crush_bgm_vol');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
      if (savedBgmVol !== null) this.bgmVolume = parseFloat(savedBgmVol) || 0.35;
    } catch {}
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? this.bgmVolume : 0, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSfxEnabled(val: boolean) {
    this.sfxEnabled = val;
    try { localStorage.setItem('jewel_crush_sfx', String(val)); } catch {}
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setBgmEnabled(val: boolean) {
    this.bgmEnabled = val;
    try { localStorage.setItem('jewel_crush_bgm', String(val)); } catch {}
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(val ? this.bgmVolume : 0, this.ctx.currentTime, 0.1);
    }
    if (val && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    try { localStorage.setItem('jewel_crush_bgm_vol', String(this.bgmVolume)); } catch {}
    if (this.bgmGain && this.ctx && this.bgmEnabled) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- SOUND EFFECTS ---

  // Jewel Swap Tick
  public playSwap() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.07);

      const vol = 0.15 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Jewel Match Crush Chimes (Pitch rises with combo)
  public playMatch(combo: number = 1) {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      // Pentatonic scale base frequencies: C5, D5, E5, G5, A5, C6, D6, E6, G6
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
      const noteIndex = Math.min(scale.length - 1, Math.max(0, (combo - 1) % scale.length));
      const baseFreq = scale[noteIndex];

      // Primary chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      const vol = Math.min(0.28, 0.16 + combo * 0.02) * this.sfxVolume;
      gain1.gain.setValueAtTime(vol, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      // Shimmer harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);

      gain2.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // Laser Row/Column Beam Zap
  public playLaserBeam() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);

      const vol = 0.22 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch {}
  }

  // Bomb Explosion Boom
  public playBombExplode() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      // Low punch oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.4);

      const vol = 0.3 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);

      // Noise blast layer using buffer
      const bufferSize = ctx.sampleRate * 0.25;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start();
      whiteNoise.stop(ctx.currentTime + 0.26);
    } catch {}
  }

  // Rainbow Color Bomb Vortex Sweep
  public playRainbowVortex() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const freqs = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        const startTime = ctx.currentTime + idx * 0.05;
        const vol = 0.12 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {}
  }

  // Ice Shatter Crisp Crunch
  public playIceShatter() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const freqs = [1800, 2400, 3200];
      freqs.forEach((f, idx) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f + Math.random() * 200, ctx.currentTime + idx * 0.02);

        const t = ctx.currentTime + idx * 0.02;
        const vol = 0.12 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch {}
  }

  // Stone Crack / Thud
  public playStoneCrack() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);

      const vol = 0.18 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  // Star Earned Ding!
  public playStarDing(starNumber: number = 1) {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const starPitches = [880, 1108.73, 1318.51];
      const freq = starPitches[Math.min(2, starNumber - 1)] || 880;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const vol = 0.22 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.48);
    } catch {}
  }

  // Level Win Fanfare
  public playWinFanfare() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      // Victory fanfare: G4 -> C5 -> E5 -> G5 (held)
      const notes = [
        { f: 392.0, d: 0.12, t: 0 },
        { f: 523.25, d: 0.12, t: 0.13 },
        { f: 659.25, d: 0.12, t: 0.26 },
        { f: 783.99, d: 0.5, t: 0.39 },
      ];

      notes.forEach((n) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

        const startTime = ctx.currentTime + n.t;
        const vol = 0.25 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + n.d + 0.05);
      });
    } catch {}
  }

  // Level Defeat / Out of Moves
  public playGameOver() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const notes = [
        { f: 440, d: 0.2, t: 0 },
        { f: 415.3, d: 0.2, t: 0.22 },
        { f: 392, d: 0.2, t: 0.44 },
        { f: 349.23, d: 0.5, t: 0.66 },
      ];

      notes.forEach((n) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

        const startTime = ctx.currentTime + n.t;
        const vol = 0.2 * this.sfxVolume;
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + n.d + 0.05);
      });
    } catch {}
  }

  // PowerUp activation
  public playPowerup() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);

      const vol = 0.2 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  public playButton() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx || !this.masterGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);

      const vol = 0.1 * this.sfxVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  // --- PROCEDURAL BGM LOOP ENGINE ---
  // A delightful, relaxing marimba & synth bell puzzle theme that loops continuously
  public startBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.isBgmPlaying = true;
    this.currentBeat = 0;

    // 112 BPM = ~0.2678s per 16th note, 0.5357s per 8th note
    const beatInterval = 270; // ms per 16th note

    // 16-bar melodic phrase loop in C Major / A Minor with sweet tropical arcade charm
    const melodyNotes = [
      // Bar 1 (C Major)
      523.25, 0, 659.25, 783.99,  1046.5, 0, 783.99, 659.25,
      // Bar 2 (G Major)
      587.33, 0, 783.99, 987.77,  1174.66, 0, 987.77, 783.99,
      // Bar 3 (A Minor)
      440.0, 0, 523.25, 659.25,   880.0, 0, 1046.5, 880.0,
      // Bar 4 (F Major)
      349.23, 0, 523.25, 659.25,  783.99, 659.25, 523.25, 392.0,
      // Bar 5 (C Major variation)
      1046.5, 0, 880.0, 783.99,   659.25, 0, 523.25, 659.25,
      // Bar 6 (G Major)
      783.99, 0, 987.77, 1046.5,  1174.66, 0, 987.77, 0,
      // Bar 7 (F -> G)
      659.25, 523.25, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66,
      // Bar 8 (C Resolution)
      1046.5, 0, 783.99, 0,       523.25, 0, 0, 0
    ];

    const bassNotes = [
      // Bar 1: C
      130.81, 0, 130.81, 0,  196.0, 0, 130.81, 0,
      // Bar 2: G
      98.0, 0, 98.0, 0,      146.83, 0, 98.0, 0,
      // Bar 3: A
      110.0, 0, 110.0, 0,    164.81, 0, 110.0, 0,
      // Bar 4: F
      87.31, 0, 87.31, 0,    130.81, 0, 174.61, 0,
      // Bar 5: C
      130.81, 0, 130.81, 0,  196.0, 0, 130.81, 0,
      // Bar 6: G
      98.0, 0, 98.0, 0,      146.83, 0, 98.0, 0,
      // Bar 7: F -> G
      87.31, 0, 87.31, 0,    98.0, 0, 98.0, 0,
      // Bar 8: C
      130.81, 0, 196.0, 0,   130.81, 0, 0, 0
    ];

    const totalSteps = melodyNotes.length;

    const playStep = () => {
      if (!this.isBgmPlaying) return;
      const curCtx = this.initCtx();
      if (!curCtx || !this.bgmGain) return;

      const step = this.currentBeat % totalSteps;
      const melFreq = melodyNotes[step];
      const bassFreq = bassNotes[step];

      // Play melody note
      if (melFreq > 0 && this.bgmEnabled) {
        try {
          const osc = curCtx.createOscillator();
          const gain = curCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(melFreq, curCtx.currentTime);

          const vol = 0.08;
          gain.gain.setValueAtTime(vol, curCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, curCtx.currentTime + 0.22);

          osc.connect(gain);
          gain.connect(this.bgmGain);

          osc.start();
          osc.stop(curCtx.currentTime + 0.24);
        } catch {}
      }

      // Play bass note
      if (bassFreq > 0 && this.bgmEnabled) {
        try {
          const osc = curCtx.createOscillator();
          const gain = curCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(bassFreq, curCtx.currentTime);

          const vol = 0.12;
          gain.gain.setValueAtTime(vol, curCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, curCtx.currentTime + 0.24);

          osc.connect(gain);
          gain.connect(this.bgmGain);

          osc.start();
          osc.stop(curCtx.currentTime + 0.26);
        } catch {}
      }

      this.currentBeat++;
      this.bgmTimer = window.setTimeout(playStep, beatInterval);
    };

    playStep();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public toggleBgm(): boolean {
    const next = !this.bgmEnabled;
    this.setBgmEnabled(next);
    return next;
  }

  public toggleSfx(): boolean {
    const next = !this.sfxEnabled;
    this.setSfxEnabled(next);
    return next;
  }
}

export const sound = new AudioEngine();
