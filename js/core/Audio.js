export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.musicSource = null;
    this.musicPlaying = false;
    this.initialized = false;
    this.biome = 'space';
    this.musicBuffer = null;
    this._musicLoadAttempted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  ensureResumed() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  setSfxVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  _osc(type, freq, duration, gainNode, ramp = false) {
    if (!this.ctx || !gainNode) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (ramp && typeof ramp === 'number') {
      osc.frequency.linearRampToValueAtTime(ramp, this.ctx.currentTime + duration);
    }
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(gainNode);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  _noise(duration, gainNode) {
    if (!this.ctx || !gainNode) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(g);
    g.connect(gainNode);
    source.start(this.ctx.currentTime);
  }

  sfxShoot() {
    this._osc('square', 800, 0.08, this.sfxGain, 200);
  }

  sfxHit() {
    this._osc('triangle', 200, 0.1, this.sfxGain, 60);
  }

  sfxMine() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  }

  sfxHurt() {
    this._noise(0.15, this.sfxGain);
  }

  sfxEnemyDeath() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  sfxEvacuate() {
    if (!this.ctx) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.2);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.2);
    });
  }

  sfxBuy() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1100, this.ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.25);
  }

  sfxBossPhase() {
    if (!this.ctx) return;
    [220, 330, 440, 550].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + i * 0.12);
      osc.stop(this.ctx.currentTime + i * 0.12 + 0.3);
    });
  }

  sfxWin() {
    if (!this.ctx) return;
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.18);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + i * 0.12);
      osc.stop(this.ctx.currentTime + i * 0.12 + 0.18);
    });
  }

  sfxLose() {
    if (!this.ctx) return;
    [440, 349, 293, 220].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.2);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.2 + 0.3);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + i * 0.2);
      osc.stop(this.ctx.currentTime + i * 0.2 + 0.3);
    });
  }

  sfxFlyerShoot() {
    this._osc('square', 1200, 0.06, this.sfxGain, 600);
  }

  startMusic(biome = 'space') {
    this.biome = biome;
    if (!this.ctx || this.musicPlaying) return;
    if (this.musicBuffer) {
      this._playBuffer();
      return;
    }
    if (this._musicLoadAttempted) return;
    this._musicLoadAttempted = true;
    this.musicPlaying = true;

    const url = 'assets/audio/bgm.mp3';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then((buffer) => this.ctx.decodeAudioData(buffer))
      .then((decoded) => {
        this.musicBuffer = decoded;
        this._playBuffer();
      })
      .catch(() => {
        this.musicPlaying = false;
      });
  }

  _playBuffer() {
    if (!this.ctx || !this.musicBuffer || !this.musicPlaying) return;
    this.musicSource = this.ctx.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start(0);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch {}
      this.musicSource = null;
    }
  }

  setBiome(biome) {
    this.biome = biome;
  }
}

export const audio = new AudioManager();
