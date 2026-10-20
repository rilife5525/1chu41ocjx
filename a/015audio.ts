// 音訊：WebAudio 合成（無外部音檔）。步進音序器 ＋ 36 種音效 ＋ 16 首曲目
// 曲長由 prog 小節數決定：主頁 8 小節＝128 步、關卡 6 小節＝96 步、Boss 4 小節＝64 步
export interface Theme {
  bpm: number; root: number;           // MIDI 根音
  scale: number[]; prog: number[];     // 音階（半音）／每小節和弦根音（音階度數）
  bassPat: number[]; arpPat: number[]; // 各 16 格
  kick: number[];                      // 16 格：1 大鼓、2 小鼓、3 兩者
  hat: number;                         // 0 無 / 1 閉 / 2 開
  lead: boolean;                       // 有無旋律聲部
}
const MIN = [0, 2, 3, 5, 7, 8, 10], DOR = [0, 2, 3, 5, 7, 9, 10], MAJ = [0, 2, 4, 5, 7, 9, 11], HAR = [0, 2, 3, 5, 7, 8, 11], PHR = [0, 1, 3, 5, 7, 8, 10], PHD = [0, 1, 4, 5, 7, 8, 10];
const BA = [1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 3, 0, 2, 0], BB = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 2, 0, 3], BC = [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0], BD = [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 2, 0];
const AR1 = [1, 2, 3, 4, 3, 2, 3, 4, 1, 2, 3, 4, 3, 2, 3, 4], AR2 = [1, 0, 3, 0, 2, 0, 4, 0, 1, 0, 3, 0, 2, 0, 4, 0], AR3 = [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 3, 2, 4, 2], AR4 = [1, 0, 0, 3, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0, 4, 0];
const K1 = [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0], K2 = [1, 0, 0, 1, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1], K3 = [1, 0, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 0], K4 = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0], K5 = [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 1];
const T = (bpm: number, root: number, scale: number[], prog: number[], bassPat: number[], arpPat: number[], kick: number[], hat: number, lead = true): Theme => ({ bpm, root, scale, prog, bassPat, arpPat, kick, hat, lead });
/** 0 主頁 1 關卡 2 關卡變奏 3 Boss；4~9 為六個星域的關卡曲；10~15 為六隻 Boss 的專屬曲 */
export const THEMES: Theme[] = [
  T(92, 57, MIN, [0, 5, 2, 6, 3, 5, 6, 4], BC, AR2, K4, 1),
  T(0, 0, MIN, [0], BA, AR1, K1, 0), T(0, 0, MIN, [0], BA, AR1, K1, 0), T(0, 0, MIN, [0], BA, AR1, K1, 0),
  T(132, 50, DOR, [0, 3, 6, 0, 3, 4], BA, AR1, K2, 1),
  T(118, 53, MAJ, [0, 4, 5, 3, 5, 4], BB, AR2, K1, 1),
  T(124, 59, HAR, [0, 5, 3, 4, 0, 5], BB, AR3, K3, 1),
  T(140, 45, PHR, [0, 1, 0, 6, 1, 0], BD, AR4, K2, 2),
  T(150, 52, MIN, [0, 5, 6, 4, 0, 2], BA, AR1, K2, 1),
  T(126, 55, MIN, [0, 5, 2, 6, 3, 4], BB, AR2, K1, 2),
  T(156, 50, PHD, [0, 1, 0, 6], BD, AR1, K5, 1),
  T(146, 46, MIN, [0, 5, 6, 4], BA, AR1, K2, 1),
  T(156, 52, HAR, [0, 5, 3, 4], BA, AR3, K5, 1),
  T(144, 43, PHR, [0, 1, 0, 6], BD, AR4, K3, 2),
  T(168, 47, MIN, [0, 6, 5, 4], BD, AR1, K5, 1),
  T(160, 50, HAR, [0, 5, 3, 4], BA, AR2, K5, 2),
];
THEMES[1] = THEMES[4]; THEMES[2] = THEMES[8]; THEMES[3] = THEMES[10];
export const THEME_NAMES = ["星詠序曲", "關卡", "關卡變奏", "Boss", "霓虹迴廊", "潮鳴", "白夜", "灰燼熔爐", "迴路", "靜寂星環", "Boss·霓虹觀測者", "Boss·螺旋審判", "Boss·白夜聖騎", "Boss·熔爐巨像", "Boss·演算戰神", "Boss·靜寂女王"];
// ── 追加區：主旋律（每小節 16 步，token＝「音階度數:步數」，r＝休止；度數以 root+12 為 0）─────────
const M: Record<number, string[]> = {
  0: ["4:6 2:2 4:4 7:4", "5:4 7:4 9:6 7:2", "9:4 8:2 7:2 6:4 4:4", "6:4 8:4 7:6 4:2", "7:6 5:2 7:4 9:4", "10:4 9:2 7:2 9:8", "8:4 7:4 6:4 8:4", "8:6 7:2 8:4 11:4"],
  4: ["7:2 r:2 7:2 9:2 11:4 9:2 7:2", "10:2 r:2 10:2 9:2 7:4 9:4", "9:2 r:2 9:2 8:2 7:4 4:4", "7:4 9:4 11:4 14:4", "10:2 11:2 12:2 11:2 10:4 7:4", "11:4 9:2 8:2 7:8"],
  5: ["4:4 7:4 9:4 7:4", "8:4 7:2 6:2 4:8", "5:4 7:4 9:4 12:4", "10:4 9:4 7:4 5:4", "9:6 7:2 5:4 7:4", "8:4 6:4 4:4 r:4"],
  6: ["7:4 9:4 11:4 9:4", "9:4 7:2 5:2 7:4 9:4", "7:4 5:2 3:2 5:4 7:4", "8:4 6:4 4:4 6:4", "11:6 9:2 7:4 9:4", "9:4 7:4 5:4 4:4"],
  7: ["0:2 r:2 0:2 1:2 2:4 1:2 0:2", "1:2 r:2 1:2 3:2 5:4 3:2 1:2", "7:4 6:2 4:2 2:4 4:4", "6:2 r:2 6:2 8:2 10:4 8:4", "8:4 7:4 5:4 3:4", "4:4 2:4 0:8"],
  8: ["7:2 4:2 7:2 9:2 11:2 9:2 7:2 4:2", "5:2 7:2 9:2 7:2 5:2 7:2 9:2 12:2", "6:2 8:2 10:2 8:2 6:2 8:2 10:2 13:2", "11:4 10:2 8:2 6:4 4:4", "7:2 4:2 7:2 9:2 11:2 9:2 7:2 4:2", "9:4 8:4 7:4 4:4"],
  9: ["7:6 4:2 5:2 4:2 2:4", "9:4 7:2 5:2 7:8", "11:4 9:4 6:4 4:4", "10:4 8:2 6:2 8:4 10:4", "10:4 9:2 7:2 5:4 3:4", "11:6 9:2 8:4 4:4"],
  10: ["7:2 r:2 7:2 8:2 9:2 8:2 7:2 4:2", "8:2 r:2 8:2 10:2 12:2 10:2 8:2 5:2", "7:2 r:2 7:2 8:2 9:2 11:2 12:4", "13:2 12:2 11:2 9:2 8:4 6:4"],
  11: ["7:3 4:1 7:2 9:2 11:4 9:2 7:2", "9:3 7:1 5:2 7:2 9:4 7:4", "10:3 8:1 6:2 8:2 10:4 8:4", "11:2 10:2 8:2 6:2 4:8"],
  12: ["7:2 9:2 11:2 9:2 7:2 4:2 7:4", "12:2 11:2 9:2 7:2 9:4 5:4", "10:2 9:2 7:2 5:2 7:4 10:4", "11:2 13:2 11:2 8:2 6:4 4:4"],
  13: ["0:3 r:1 0:2 1:2 3:4 1:4", "1:3 r:1 1:2 3:2 5:4 3:4", "7:3 6:1 4:2 3:2 4:4 6:4", "6:2 8:2 10:2 8:2 6:4 3:4"],
  14: ["7:2 9:2 7:2 11:2 9:2 7:2 4:2 7:2", "6:2 8:2 6:2 10:2 8:2 6:2 4:2 6:2", "5:2 7:2 5:2 9:2 7:2 5:2 3:2 5:2", "4:2 6:2 8:2 11:2 10:4 8:4"],
  15: ["9:4 7:2 9:2 11:4 9:4", "12:4 11:2 9:2 7:4 5:4", "10:4 9:2 7:2 5:4 7:4", "11:2 13:2 11:2 8:2 6:4 4:4"],
};
M[1] = M[4]; M[2] = M[8]; M[3] = M[10];
type Ev = { deg: number; len: number };
const melCache = new Map<number, (Ev | null)[]>();
function melody(idx: number): (Ev | null)[] {
  let m = melCache.get(idx); if (m) return m;
  const bars = M[idx] || [], out: (Ev | null)[] = [];
  for (const bar of bars) {
    let pos = 0; const slots: (Ev | null)[] = new Array(16).fill(null);
    for (const tok of bar.split(" ")) { const [d, l] = tok.split(":"), len = Math.max(1, parseInt(l, 10) || 1); if (pos >= 16) break; if (d !== "r") slots[pos] = { deg: parseInt(d, 10), len: Math.min(len, 16 - pos) }; pos += len; }
    out.push(...slots);
  }
  melCache.set(idx, out); return out;
}
// ── 合成器 ──────────────────────────────────────────────────────
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const semi = (th: Theme, d: number) => { const n = th.scale.length, o = Math.floor(d / n), i = ((d % n) + n) % n; return th.scale[i] + 12 * o; };
class AudioSys {
  private ctx: AudioContext | null = null;
  private bgmBus!: GainNode; private sfxBus!: GainNode; private master!: GainNode; private dly!: GainNode; private noiseBuf!: AudioBuffer;
  vol = { bgm: 0.55, sfx: 0.7 };
  private want = -1; private cur = -1; private step = 0; private next = 0; private timer = 0; private last: Record<string, number> = {};
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!AC) return;
      const a = new AC(); this.ctx = a;
      const comp = a.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      this.master = a.createGain(); this.master.gain.value = 0.9; this.master.connect(comp); comp.connect(a.destination);
      this.bgmBus = a.createGain(); this.sfxBus = a.createGain(); this.bgmBus.connect(this.master); this.sfxBus.connect(this.master);
      const d = a.createDelay(1); d.delayTime.value = 0.28; const fb = a.createGain(); fb.gain.value = 0.32; const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      this.dly = a.createGain(); this.dly.gain.value = 0.35; this.dly.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.bgmBus);
      this.noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const ch = this.noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      this.setVolume(this.vol.bgm, this.vol.sfx);
      document.addEventListener("visibilitychange", () => { if (!this.ctx) return; if (document.hidden) this.ctx.suspend(); else this.ctx.resume(); });
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.want >= 0 && this.cur !== this.want) this.start(this.want);
  }
  setVolume(bgm: number, sfx: number) { this.vol = { bgm, sfx }; if (!this.ctx) return; this.bgmBus.gain.setTargetAtTime(bgm * 0.8, this.ctx.currentTime, 0.05); this.sfxBus.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05); }
  /** 切換曲目（同曲不重播） */
  music(i: number) { this.want = i; if (!this.ctx || this.cur === i) return; this.start(i); }
  stopMusic() { this.want = -1; this.cur = -1; clearInterval(this.timer); }
  /** 暫時壓低背景音樂（奧義演出時使用） */
  duck(k: number, sec: number) { if (!this.ctx) return; const t = this.ctx.currentTime, g = this.bgmBus.gain; g.cancelScheduledValues(t); g.setTargetAtTime(this.vol.bgm * 0.8 * k, t, 0.05); g.setTargetAtTime(this.vol.bgm * 0.8, t + sec, 0.4); }
  private start(i: number) {
    const a = this.ctx!; clearInterval(this.timer); this.cur = i; this.step = 0; this.next = a.currentTime + 0.12;
    const g = this.bgmBus.gain; g.cancelScheduledValues(a.currentTime); g.setValueAtTime(0.0001, a.currentTime); g.linearRampToValueAtTime(this.vol.bgm * 0.8, a.currentTime + 0.5);
    this.timer = window.setInterval(() => this.pump(), 28);
  }
  private pump() {
    const a = this.ctx; if (!a || this.cur < 0) return; const th = THEMES[this.cur], spb = 60 / th.bpm / 4, len = th.prog.length * 16;
    while (this.next < a.currentTime + 0.16) { this.play(th, this.step, this.next, spb); this.step = (this.step + 1) % len; this.next += spb; }
  }
  private play(th: Theme, step: number, t: number, spb: number) {
    const bar = Math.floor(step / 16), s = step % 16, rd = th.prog[bar], root = th.root, ms = melody(this.cur);
    const k = th.kick[s]; if (k & 1) this.kick(t); if (k & 2) this.snare(t);
    if (th.hat) { if (s % 2 === 1) this.hat(t, 0.5, false); else if (th.hat === 2 && s % 4 === 2) this.hat(t, 0.8, true); else if (s % 4 === 0) this.hat(t, 0.3, false); }
    const bp = th.bassPat[s]; if (bp) { const d = bp === 1 ? rd : bp === 2 ? rd + 7 : bp === 3 ? rd + 4 : rd + 2; this.bass(root - 12 + semi(th, d), t, spb * (bp === 2 ? 1.6 : 1.9)); }
    const ap = th.arpPat[s]; if (ap) { const d = rd + [0, 0, 2, 4, 7][ap]; this.arp(root + 12 + semi(th, d), t, spb * 1.6); }
    if (s === 0) for (const o of [0, 2, 4]) this.pad(root + semi(th, rd + o), t, spb * 16);
    if (th.lead) { const e = ms[step]; if (e) this.lead(root + 12 + semi(th, e.deg), t, spb * e.len * 0.96); }
  }
  private g(vol: number, t: number, a: number, d: number, dest: AudioNode) { const g = this.ctx!.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); g.connect(dest); return g; }
  private kick(t: number) { const a = this.ctx!, o = a.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); o.connect(this.g(0.95, t, 0.002, 0.18, this.bgmBus)); o.start(t); o.stop(t + 0.22); }
  private noise(t: number, dur: number, vol: number, type: BiquadFilterType, f: number, dest: AudioNode, f1?: number) {
    const a = this.ctx!, n = a.createBufferSource(); n.buffer = this.noiseBuf; const fl = a.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    n.connect(fl); fl.connect(this.g(vol, t, 0.002, dur, dest)); n.start(t, Math.random() * 0.5); n.stop(t + dur + 0.05);
  }
  private snare(t: number) { this.noise(t, 0.15, 0.4, "bandpass", 1800, this.bgmBus); const o = this.ctx!.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.1); o.connect(this.g(0.35, t, 0.002, 0.11, this.bgmBus)); o.start(t); o.stop(t + 0.15); }
  private hat(t: number, v: number, open: boolean) { this.noise(t, open ? 0.2 : 0.045, 0.16 * v, "highpass", 7500, this.bgmBus); }
  private osc(type: OscillatorType, f: number, t: number, dur: number, vol: number, dest: AudioNode, lp = 0, det = 0) {
    const a = this.ctx!, o = a.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
    let out: AudioNode = this.g(vol, t, 0.006, dur, dest);
    if (lp) { const fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.setValueAtTime(lp * 3, t); fl.frequency.exponentialRampToValueAtTime(lp, t + dur * 0.8); fl.connect(out); out = fl; }
    o.connect(out); o.start(t); o.stop(t + dur + 0.06);
  }
  private bass(m: number, t: number, dur: number) { this.osc("sawtooth", mtof(m), t, dur, 0.26, this.bgmBus, 520); this.osc("sine", mtof(m), t, dur, 0.3, this.bgmBus); }
  private arp(m: number, t: number, dur: number) { this.osc("square", mtof(m), t, dur, 0.07, this.bgmBus, 2600); this.osc("triangle", mtof(m + 12), t, dur * 0.6, 0.05, this.dly); }
  private pad(m: number, t: number, dur: number) { for (const d of [-7, 7]) { const a = this.ctx!, o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = d; const fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 900; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(fl); fl.connect(g); g.connect(this.bgmBus); o.start(t); o.stop(t + dur + 0.05); } }
  private lead(m: number, t: number, dur: number) {
    const a = this.ctx!, f = mtof(m), g = this.g(0.15, t, 0.012, Math.max(0.08, dur), this.bgmBus), send = a.createGain(); send.gain.value = 0.5; g.connect(send); send.connect(this.dly);
    for (const [ty, det] of [["sawtooth", -6], ["square", 6]] as [OscillatorType, number][]) { const o = a.createOscillator(); o.type = ty; o.frequency.value = f; o.detune.value = det; const lfo = a.createOscillator(); lfo.frequency.value = 5.2; const lg = a.createGain(); lg.gain.value = 7; lfo.connect(lg); lg.connect(o.detune); const fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 3200; o.connect(fl); fl.connect(g); o.start(t); lfo.start(t); o.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1); }
  }
  // ── 音效 ──
  private tn(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, at = 0) {
    const a = this.ctx!, t = a.currentTime + at, o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    o.connect(this.g(vol, t, 0.004, dur, this.sfxBus)); o.start(t); o.stop(t + dur + 0.05);
  }
  private nz(dur: number, vol: number, type: BiquadFilterType, f0: number, f1: number, at = 0) { this.noise(this.ctx!.currentTime + at, dur, vol, type, f0, this.sfxBus, f1); }
  sfx(name: string, throttle = 0.04) {
    const a = this.ctx; if (!a || a.state !== "running") return;
    const now = a.currentTime; if (now - (this.last[name] ?? -9) < throttle) return; this.last[name] = now;
    const T = this.tn.bind(this), N = this.nz.bind(this);
    switch (name) {
      case "shoot0": T("square", 900, 420, 0.06, 0.07); break;
      case "shoot1": T("sawtooth", 700, 300, 0.07, 0.06); break;
      case "shoot2": T("triangle", 1300, 640, 0.06, 0.09); break;
      case "shoot3": T("square", 520, 200, 0.09, 0.07); N(0.05, 0.05, "highpass", 4000, 6000); break;
      case "shoot4": T("sine", 1500, 900, 0.07, 0.1); T("triangle", 760, 380, 0.06, 0.05); break;
      case "shoot5": T("sawtooth", 300, 130, 0.12, 0.08); break;
      case "hit": N(0.05, 0.1, "bandpass", 2200, 1200); break;
      case "boom_s": N(0.22, 0.28, "lowpass", 1800, 200); T("sine", 120, 40, 0.18, 0.3); break;
      case "boom_m": N(0.4, 0.4, "lowpass", 1400, 120); T("sine", 100, 32, 0.3, 0.4); break;
      case "boom_l": N(0.8, 0.5, "lowpass", 1200, 80); T("sine", 80, 26, 0.6, 0.5); N(0.5, 0.2, "highpass", 3000, 800, 0.05); break;
      case "pickup": T("triangle", 700, 1400, 0.1, 0.12); break;
      case "coin": T("square", 1320, 1320, 0.05, 0.08); T("square", 1760, 1760, 0.09, 0.08, 0.05); break;
      case "power": T("triangle", 500, 1500, 0.22, 0.14); T("sine", 1000, 2000, 0.18, 0.08, 0.05); break;
      case "levelup": for (let i = 0; i < 4; i++) T("triangle", 520 * Math.pow(1.26, i), 520 * Math.pow(1.26, i), 0.14, 0.14, i * 0.07); break;
      case "evolve": for (let i = 0; i < 6; i++) T("sawtooth", 330 * Math.pow(1.19, i), 330 * Math.pow(1.19, i), 0.2, 0.1, i * 0.06); N(0.6, 0.12, "highpass", 2000, 6000); break;
      case "active": T("sawtooth", 260, 900, 0.25, 0.12); N(0.2, 0.1, "bandpass", 1000, 4000); break;
      case "ultcut": T("sawtooth", 110, 440, 0.7, 0.16); T("square", 220, 880, 0.7, 0.08); N(0.6, 0.18, "bandpass", 500, 6000); break;
      case "ultgo": T("sine", 90, 30, 0.8, 0.5); N(0.7, 0.35, "lowpass", 3000, 100); T("sawtooth", 440, 1760, 0.4, 0.12); break;
      case "hurt": T("sawtooth", 220, 70, 0.3, 0.22); N(0.25, 0.25, "lowpass", 1200, 150); break;
      case "graze": T("sine", 2400, 3200, 0.03, 0.04); break;
      case "warning": for (let i = 0; i < 4; i++) { T("square", 880, 880, 0.18, 0.11, i * 0.34); T("square", 660, 660, 0.16, 0.11, i * 0.34 + 0.17); } break;
      case "bossdie": N(1.4, 0.5, "lowpass", 1600, 60); T("sine", 90, 24, 1.2, 0.55); for (let i = 0; i < 5; i++) N(0.3, 0.3, "lowpass", 1400, 100, i * 0.2); break;
      case "lightning": N(0.25, 0.3, "bandpass", 3500, 800); T("sawtooth", 1600, 200, 0.2, 0.1); break;
      case "laser": T("sawtooth", 1800, 400, 0.5, 0.1); T("square", 900, 300, 0.5, 0.06); break;
      case "charge": T("sawtooth", 140, 1100, 0.9, 0.1); N(0.9, 0.1, "bandpass", 400, 5000); break;
      case "lock": T("square", 1500, 1500, 0.04, 0.09); T("square", 1900, 1900, 0.06, 0.09, 0.06); break;
      case "whoosh": N(0.35, 0.2, "bandpass", 600, 3000); break;
      case "gear": T("square", 400, 800, 0.05, 0.08); T("square", 600, 1200, 0.08, 0.08, 0.06); break;
      case "ui": T("triangle", 900, 700, 0.05, 0.07); break;
      case "ui_hover": T("sine", 1400, 1400, 0.025, 0.04); break;
      case "ui_ok": T("triangle", 660, 990, 0.09, 0.12); T("triangle", 990, 1320, 0.12, 0.1, 0.07); break;
      case "ui_back": T("triangle", 700, 420, 0.1, 0.09); break;
      case "clear": for (let i = 0; i < 6; i++) T("triangle", 392 * Math.pow(1.26, i % 4), 392 * Math.pow(1.26, i % 4), 0.3, 0.14, i * 0.12); break;
      case "fail": T("sawtooth", 300, 60, 1.1, 0.2); N(0.9, 0.15, "lowpass", 800, 80); break;
      case "morph": T("sawtooth", 200, 1600, 0.6, 0.12); T("square", 400, 100, 0.6, 0.06); break;
      case "black": T("sine", 60, 30, 1, 0.3); N(0.8, 0.2, "lowpass", 600, 60); break;
      default: T("triangle", 800, 600, 0.05, 0.05);
    }
  }
}
export const audio = new AudioSys();
