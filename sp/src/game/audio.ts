// 音訊系統：以 WebAudio 即時合成音效與程序化 BGM（無外部音檔，低延遲）
type Wave = OscillatorType;

interface Theme {
  bpm: number;
  root: number; // MIDI
  scale: number[];
  prog: number[]; // 和弦根音（音階度數）
  bassPat: number[];
  arpPat: number[];
  kick: number[];
  hat: number;
  lead: boolean;
}

const THEMES: Theme[] = [
  { bpm: 112, root: 45, scale: [0, 3, 5, 7, 10], prog: [0, 3, 2, 4], bassPat: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], arpPat: [0, 2, 4, 2, 3, 2, 4, 1], kick: [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: false }, // 選單（放克爵士感）
  { bpm: 140, root: 43, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], bassPat: [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1], arpPat: [0, 2, 4, 6, 4, 2, 5, 3], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], hat: 1, lead: true },
  { bpm: 148, root: 40, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 3, 5, 4], bassPat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1], arpPat: [0, 3, 5, 3, 6, 3, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0], hat: 1, lead: true },
  { bpm: 156, root: 38, scale: [0, 1, 4, 5, 7, 8, 11], prog: [0, 5, 1, 4], bassPat: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], arpPat: [0, 4, 2, 6, 3, 5, 1, 4], kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], hat: 1, lead: true }, // Boss
];

export class AudioSys {
  ctx: AudioContext | null = null;
  master!: GainNode;
  sfxG!: GainNode;
  bgmG!: GainNode;
  comp!: DynamicsCompressorNode;
  noiseBuf: AudioBuffer | null = null;
  last: Record<string, number> = {};
  bgmVol = 0.55;
  sfxVol = 0.8;
  timer: number | null = null;
  step = 0;
  nextT = 0;
  theme = 0;
  playing = false;
  muted = false;

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -14;
      this.comp.ratio.value = 6;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.sfxG = this.ctx.createGain();
      this.bgmG = this.ctx.createGain();
      this.sfxG.connect(this.master);
      this.bgmG.connect(this.master);
      this.master.connect(this.comp);
      this.comp.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.setVolumes(this.bgmVol, this.sfxVol);
    } catch {
      this.ctx = null;
    }
  }

  setVolumes(bgm: number, sfx: number) {
    this.bgmVol = bgm;
    this.sfxVol = sfx;
    if (this.ctx) {
      this.bgmG.gain.value = bgm * 0.32;
      this.sfxG.gain.value = sfx * 0.7;
    }
  }

  private tone(f: number, d: number, type: Wave = "square", v = 0.2, slide = 0, delay = 0, dest?: AudioNode) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest || this.sfxG);
    o.start(t);
    o.stop(t + d + 0.02);
  }

  private noise(d: number, v = 0.2, f0 = 2000, f1 = 400, type: BiquadFilterType = "lowpass", delay = 0, dest?: AudioNode) {
    const c = this.ctx;
    if (!c || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
    const g = c.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f);
    f.connect(g);
    g.connect(dest || this.sfxG);
    s.start(t, Math.random());
    s.stop(t + d + 0.02);
  }

  /** 播放音效；throttle 秒內同名音效只播一次以避免爆音 */
  sfx(name: string, throttle = 0.04) {
    const c = this.ctx;
    if (!c || this.muted) return;
    const now = c.currentTime;
    if (this.last[name] && now - this.last[name] < throttle) return;
    this.last[name] = now;
    switch (name) {
      case "shoot0": this.tone(520 + Math.random() * 60, 0.06, "sawtooth", 0.05, -300); this.noise(0.05, 0.04, 6000, 1500, "highpass"); break;
      case "shoot1": this.tone(1500, 0.05, "sine", 0.06, -600); this.tone(2200, 0.03, "triangle", 0.03); break;
      case "shoot2": this.noise(0.09, 0.05, 900, 3000, "bandpass"); break;
      case "shoot3": this.tone(900 + Math.random() * 300, 0.04, "sawtooth", 0.045, -500); break;
      case "shoot4": this.tone(150, 0.12, "sine", 0.1, -70); this.tone(700, 0.05, "triangle", 0.03, 200); break;
      case "shoot5": this.tone(780, 0.05, "triangle", 0.06, 200); break;
      case "hit": this.tone(300 + Math.random() * 200, 0.03, "square", 0.03, -100); break;
      case "boom_s": this.noise(0.22, 0.16, 2600, 200); this.tone(120, 0.15, "sine", 0.12, -80); break;
      case "boom_m": this.noise(0.4, 0.28, 2200, 120); this.tone(90, 0.3, "sine", 0.22, -60); break;
      case "boom_l": this.noise(1.1, 0.5, 2600, 60); this.tone(70, 0.9, "sine", 0.4, -45); this.tone(40, 1.2, "sine", 0.3, -20, 0.1); break;
      case "pickup": this.tone(880, 0.06, "triangle", 0.08, 400); break;
      case "coin": this.tone(1320, 0.05, "square", 0.05, 500); this.tone(1980, 0.08, "square", 0.04, 0, 0.05); break;
      case "power": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.09, "square", 0.08, 0, i * 0.05)); break;
      case "levelup": [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, 0.16, "triangle", 0.12, 0, i * 0.07)); break;
      case "evolve": [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => { this.tone(f, 0.3, "sawtooth", 0.07, 0, i * 0.06); this.tone(f * 2, 0.3, "sine", 0.06, 0, i * 0.06); }); this.noise(0.8, 0.1, 400, 8000, "highpass", 0.3); break;
      case "active": this.tone(220, 0.35, "sawtooth", 0.12, 660); this.noise(0.4, 0.14, 500, 5000, "bandpass"); break;
      case "ultcut": this.tone(110, 0.9, "sawtooth", 0.22, 440); this.tone(55, 1.2, "sine", 0.3, 20); this.noise(0.9, 0.2, 200, 9000, "highpass"); [0, 0.25, 0.5, 0.75].forEach((d) => this.tone(880 + d * 900, 0.1, "square", 0.08, 0, d)); break;
      case "ultgo": this.noise(1.2, 0.5, 6000, 100); this.tone(65, 1.2, "sine", 0.5, -30); this.tone(220, 0.8, "sawtooth", 0.16, 880); break;
      case "hurt": this.noise(0.35, 0.35, 1800, 90); this.tone(160, 0.3, "sawtooth", 0.24, -110); break;
      case "graze": this.tone(1800, 0.03, "sine", 0.04, 800); break;
      case "warning": [0, 0.5, 1, 1.5].forEach((d) => { this.tone(660, 0.3, "square", 0.12, -180, d); this.tone(330, 0.3, "sawtooth", 0.08, 0, d); }); break;
      case "bossdie": this.noise(2.2, 0.6, 3000, 50); this.tone(60, 2, "sine", 0.5, -30); [0, 0.3, 0.6, 0.9, 1.2].forEach((d) => this.noise(0.3, 0.3, 2400, 200, "lowpass", d)); break;
      case "lightning": this.noise(0.28, 0.35, 8000, 300, "highpass"); this.tone(90, 0.25, "sawtooth", 0.2, -50); break;
      case "laser": this.tone(1200, 0.35, "sawtooth", 0.09, -900); this.noise(0.35, 0.1, 5000, 800, "bandpass"); break;
      case "charge": this.tone(200, 0.6, "sawtooth", 0.1, 1200); break;
      case "lock": this.tone(1400, 0.05, "square", 0.08); this.tone(2100, 0.05, "square", 0.05, 0, 0.03); break;
      case "whoosh": this.noise(0.5, 0.25, 300, 6000, "bandpass"); break;
      case "gear": [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.18, "sine", 0.09, 0, i * 0.06)); break;
      case "ui": this.tone(660, 0.05, "square", 0.06, 220); break;
      case "ui_hover": this.tone(440, 0.03, "triangle", 0.04); break;
      case "ui_ok": this.tone(523, 0.06, "square", 0.07); this.tone(784, 0.1, "square", 0.07, 0, 0.06); break;
      case "ui_back": this.tone(392, 0.07, "square", 0.06, -120); break;
      case "clear": [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, "square", 0.1, 0, i * 0.12)); break;
      case "fail": [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.35, "sawtooth", 0.1, -20, i * 0.22)); break;
      case "morph": this.noise(0.6, 0.2, 800, 5000, "bandpass"); [220, 330, 440, 660].forEach((f, i) => this.tone(f, 0.2, "square", 0.08, 100, i * 0.08)); break;
      case "black": this.tone(50, 1.5, "sine", 0.35, -15); this.noise(1.2, 0.2, 3000, 100); break;
    }
  }

  // ------------- BGM 步進式排程器 -------------
  playBgm(themeIdx: number) {
    if (!this.ctx) return;
    this.theme = Math.max(0, Math.min(THEMES.length - 1, themeIdx));
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextT = this.ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 40);
  }

  setTheme(idx: number) {
    this.theme = Math.max(0, Math.min(THEMES.length - 1, idx));
  }

  stopBgm() {
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  private midi(n: number) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  private schedule() {
    const c = this.ctx;
    if (!c || !this.playing) return;
    const th = THEMES[this.theme];
    const stepDur = 60 / th.bpm / 4;
    while (this.nextT < c.currentTime + 0.18) {
      this.playStep(th, this.step, this.nextT - c.currentTime);
      this.nextT += stepDur;
      this.step++;
    }
  }

  private playStep(th: Theme, s: number, delay: number) {
    const i = s % 16;
    const bar = Math.floor(s / 16) % th.prog.length;
    const deg = th.prog[bar];
    const rootNote = th.root + th.scale[deg % th.scale.length];
    const d = Math.max(0, delay);
    const dest = this.bgmG;
    if (th.kick[i]) {
      this.tone(140, 0.14, "sine", 0.7, -110, d, dest);
    }
    if (i % 8 === 4) this.noise(0.14, 0.32, 3500, 1200, "bandpass", d, dest);
    if (i % (th.hat * 2) === 0 || (th.hat === 1 && i % 2 === 0)) this.noise(0.03, 0.1, 9000, 7000, "highpass", d, dest);
    if (th.bassPat[i]) this.tone(this.midi(rootNote - 12), 0.16, "sawtooth", 0.3, 0, d, dest);
    const a = th.arpPat[i % th.arpPat.length];
    if (i % 2 === 0 || th.lead) {
      const n = rootNote + 12 + th.scale[(deg + a) % th.scale.length] + (Math.floor((deg + a) / th.scale.length) * 12);
      this.tone(this.midi(n), 0.11, "square", th.lead ? 0.13 : 0.09, 0, d, dest);
    }
    if (i === 0) {
      // 和弦墊音
      [0, 2, 4].forEach((k) => {
        const n = rootNote + th.scale[(deg + k) % th.scale.length] + Math.floor((deg + k) / th.scale.length) * 12;
        this.tone(this.midi(n), (60 / th.bpm) * 3.6, "triangle", 0.1, 0, d, dest);
      });
    }
  }
}

export const audio = new AudioSys();
