// 關卡資料與時間軸產生器：六個主題關卡 + 無限模式的動態波次
import { makeRng } from "../constants";
import type { BgKind } from "../render/background";

export interface StageDef {
  id: number;
  name: string;
  en: string;
  sub: string;
  desc: string;
  bgs: [string, string];
  mix: [number, number]; // 圖片轉場起訖（進度 0~1）
  kind: BgKind;
  kindB: BgKind;
  grade: [string, string, string]; // 進度 0/0.5/1 的色彩分級
  cloudCol: string;
  theme: number; // 敵機配色索引
  boss: number;
  mid: string;
  pool: string[];
  heavy: string[];
  events: string[];
  hpMul: number;
  len: number; // Boss 出現時間（秒）
  music: number;
  rec: number; // 建議戰力
  reward: number;
  accent: string;
}

export const STAGES: StageDef[] = [
  {
    id: 1, name: "霓虹迷城", en: "NEON LABYRINTH", sub: "海岸線突入", desc: "叛逆的第一步。越過海岸防線，突入被灰幕籠罩的霓虹都市。",
    bgs: ["ocean", "city"], mix: [0.34, 0.5], kind: "ocean", kindB: "city", grade: ["rgba(255,170,90,0.16)", "rgba(120,60,200,0.18)", "rgba(255,50,200,0.16)"], cloudCol: "#ffe2ff",
    theme: 0, boss: 0, mid: "mid_gunship", pool: ["scout", "dart", "wing", "sentry", "kami"], heavy: ["heavy", "sentry"], events: ["laserGrid", "rush"],
    hpMul: 1, len: 96, music: 1, rec: 0, reward: 1, accent: "#ff3bd0",
  },
  {
    id: 2, name: "蒼海航線", en: "AZURE ARMADA", sub: "艦隊迎擊", desc: "離開都市，直面灰幕的海上艦隊。砲火與魚雷從四面八方襲來。",
    bgs: ["city", "ocean"], mix: [0.36, 0.52], kind: "city", kindB: "ocean", grade: ["rgba(90,60,200,0.18)", "rgba(40,120,220,0.14)", "rgba(255,170,60,0.16)"], cloudCol: "#e6f0ff",
    theme: 1, boss: 1, mid: "mid_cruiser", pool: ["scout", "wing", "sentry", "turret", "minelayer", "orbiter", "sniper", "dart"], heavy: ["heavy", "cruiser"], events: ["torpedo", "gale"],
    hpMul: 1.35, len: 104, music: 1, rec: 900, reward: 1.25, accent: "#ffb347",
  },
  {
    id: 3, name: "凍原極光", en: "FROZEN AURORA", sub: "極地封鎖線", desc: "極光之下的冰封海域，暴風雪與幻影機編隊在此設下封鎖。",
    bgs: ["ocean", "ice"], mix: [0.3, 0.48], kind: "ocean", kindB: "ice", grade: ["rgba(60,140,220,0.14)", "rgba(80,220,255,0.14)", "rgba(120,255,220,0.16)"], cloudCol: "#f0fbff",
    theme: 2, boss: 2, mid: "mid_walker", pool: ["dart", "wing", "sentry", "spinner", "ghost", "aegis", "sniper", "orbiter"], heavy: ["heavy", "cruiser"], events: ["gale", "meteor"],
    hpMul: 1.8, len: 110, music: 2, rec: 2200, reward: 1.5, accent: "#47e0ff",
  },
  {
    id: 4, name: "熔岩深淵", en: "MAGMA ABYSS", sub: "冰火交界", desc: "冰原盡頭是沸騰的火山帶。灼熱的彈雨與熔岩砲台等待著你。",
    bgs: ["ice", "volcano"], mix: [0.34, 0.5], kind: "ice", kindB: "volcano", grade: ["rgba(100,200,255,0.12)", "rgba(255,120,40,0.18)", "rgba(255,70,20,0.2)"], cloudCol: "#3a2622",
    theme: 3, boss: 3, mid: "mid_gunship", pool: ["scout", "kami", "turret", "spinner", "heavy", "minelayer", "aegis", "sentry"], heavy: ["heavy", "cruiser", "carrier"], events: ["meteor", "lightning"],
    hpMul: 2.4, len: 116, music: 2, rec: 4200, reward: 1.8, accent: "#ff7a2a",
  },
  {
    id: 5, name: "緋紅要塞", en: "SCARLET CITADEL", sub: "灰幕本營", desc: "灰幕帝國的軌道要塞。機械與彈幕交織成一座鋼鐵迷宮。",
    bgs: ["volcano", "cyber"], mix: [0.34, 0.5], kind: "volcano", kindB: "cyber", grade: ["rgba(255,90,40,0.16)", "rgba(255,40,80,0.18)", "rgba(200,30,90,0.2)"], cloudCol: "#2a1020",
    theme: 4, boss: 4, mid: "mid_walker", pool: ["wing", "sentry", "turret", "spinner", "sniper", "ghost", "aegis", "minelayer", "orbiter", "kami"], heavy: ["heavy", "cruiser", "carrier"], events: ["laserGrid", "lightning"],
    hpMul: 3.1, len: 122, music: 3, rec: 7000, reward: 2.2, accent: "#ff3b52",
  },
  {
    id: 6, name: "天頂王座", en: "ZENITH THRONE", sub: "終幕・叛逆之空", desc: "衝出大氣層，直搗灰幕之王的王座。這是最後、也是最華麗的一戰。",
    bgs: ["cyber", "space"], mix: [0.32, 0.48], kind: "cyber", kindB: "space", grade: ["rgba(255,40,80,0.16)", "rgba(120,80,255,0.16)", "rgba(255,210,110,0.16)"], cloudCol: "#d8c8ff",
    theme: 5, boss: 5, mid: "mid_cruiser", pool: ["dart", "wing", "sentry", "spinner", "sniper", "ghost", "aegis", "minelayer", "orbiter", "kami", "turret"], heavy: ["heavy", "cruiser", "carrier"], events: ["meteor", "lightning", "laserGrid", "gale"],
    hpMul: 4.2, len: 130, music: 3, rec: 11000, reward: 3, accent: "#ffd36b",
  },
];

// ---------------------------------------------------------------------------
export interface SpawnOpt {
  elite?: boolean;
  dir?: number;
  hpMul?: number;
  a?: number;
  b?: number;
}
export type TEvent =
  | { t: number; k: "spawn"; e: string; x: number; y: number; o?: SpawnOpt }
  | { t: number; k: "event"; name: string; dur: number }
  | { t: number; k: "mid" }
  | { t: number; k: "boss" }
  | { t: number; k: "banner"; text: string; sub?: string }
  | { t: number; k: "flyby"; kind: string }
  | { t: number; k: "waitMid" };

class Builder {
  ev: TEvent[] = [];
  constructor(public R: () => number, public diff: number) {}
  sp(t: number, e: string, x: number, y = -40, o?: SpawnOpt) {
    this.ev.push({ t, k: "spawn", e, x, y, o });
  }
  rr(a: number, b: number) {
    return a + this.R() * (b - a);
  }
  ri(a: number, b: number) {
    return Math.floor(this.rr(a, b + 1));
  }
  n(base: number, i: number) {
    return Math.max(1, Math.round(base * (1 + i * 0.6) * (1 + this.diff * 0.12)));
  }

  // ---- 波次樣板：回傳持續時間 ----
  scoutLine(t: number, i: number, e = "scout") {
    const n = this.n(5, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.32, e, 0.1 + (0.8 * k) / Math.max(1, n - 1));
    return 4.2;
  }
  columns(t: number, i: number, e = "scout") {
    const n = this.n(6, i);
    const x = this.rr(0.15, 0.85);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.36, e, x + Math.sin(k * 0.5) * 0.05);
    return 4;
  }
  vee(t: number, i: number, e = "wing") {
    const n = this.n(5, i);
    const cx = this.rr(0.3, 0.7);
    for (let k = 0; k < n; k++) {
      const off = k - (n - 1) / 2;
      this.sp(t + Math.abs(off) * 0.32, e, cx + off * 0.09);
    }
    return 4.4;
  }
  sweep(t: number, i: number, dir: number, e = "dart") {
    const n = this.n(6, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.26, e, dir > 0 ? -0.06 : 1.06, 70 + (k % 3) * 40, { dir });
    return 4.5;
  }
  cross(t: number, i: number) {
    this.sweep(t, i, 1);
    this.sweep(t + 1.3, i, -1);
    return 6.2;
  }
  sine(t: number, i: number, e = "wing") {
    const n = this.n(6, i);
    const x = this.rr(0.25, 0.75);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.4, e, x, -40, { a: k % 2 ? 1 : -1 });
    return 5;
  }
  sentries(t: number, i: number) {
    const n = i > 0.5 ? 3 : 2;
    const xs = n === 3 ? [0.2, 0.5, 0.8] : [0.28, 0.72];
    xs.forEach((x, k) => this.sp(t + k * 0.6, "sentry", x, -40, { b: 90 + k * 30 }));
    if (i > 0.3) this.scoutLine(t + 2, i * 0.6);
    return 6;
  }
  kamiRain(t: number, i: number) {
    const n = this.n(7, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.38, "kami", this.rr(0.08, 0.92));
    return 5;
  }
  heavyWave(t: number, i: number, e = "heavy") {
    this.sp(t, e, this.rr(0.3, 0.7));
    this.scoutLine(t + 1.5, i * 0.5);
    return 8;
  }
  turrets(t: number, i: number) {
    const n = this.n(4, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.9, "turret", 0.12 + (k % 2 ? 0.7 : 0.18) + this.rr(-0.06, 0.06));
    return n * 0.9 + 2;
  }
  minelayer(t: number, i: number) {
    this.sp(t, "minelayer", this.R() > 0.5 ? -0.08 : 1.08, 120, { dir: 1 });
    this.scoutLine(t + 2.4, i * 0.4);
    return 7;
  }
  snipers(t: number, i: number) {
    this.sp(t, "sniper", 0.12);
    this.sp(t + 0.6, "sniper", 0.88);
    if (i > 0.5) this.sp(t + 1.2, "sniper", 0.5);
    this.kamiRain(t + 1, i * 0.5);
    return 7;
  }
  spinner(t: number, i: number) {
    this.sp(t, "spinner", this.rr(0.35, 0.65));
    const n = this.n(4, i * 0.5);
    for (let k = 0; k < n; k++) this.sp(t + 0.6 + k * 0.15, "orbiter", 0.5, -40, { a: (k * Math.PI * 2) / n });
    return 8;
  }
  cruiser(t: number, i: number) {
    this.sp(t, "cruiser", this.rr(0.3, 0.7));
    this.vee(t + 2.5, i * 0.5);
    return 9;
  }
  ghosts(t: number, i: number) {
    const n = this.n(4, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.7, "ghost", this.rr(0.15, 0.85), this.rr(80, 260));
    return 6.5;
  }
  carrier(t: number, i: number) {
    this.sp(t, "carrier", this.rr(0.35, 0.65));
    this.sine(t + 3, i * 0.5, "scout");
    return 10;
  }
  aegis(t: number, i: number) {
    this.sp(t, "aegis", 0.3, -40, { b: 120 });
    this.sp(t + 0.4, "aegis", 0.7, -40, { b: 150 });
    if (i > 0.5) this.sp(t + 0.8, "aegis", 0.5, -40, { b: 200 });
    return 7;
  }
  orbiters(t: number, i: number) {
    const n = this.n(6, i);
    for (let k = 0; k < n; k++) this.sp(t + k * 0.1, "orbiter", this.rr(0.3, 0.7), -40, { a: (k * Math.PI * 2) / n });
    return 6;
  }
  eliteOf(t: number, e: string) {
    this.sp(t, e, this.rr(0.3, 0.7), -40, { elite: true });
    return 7;
  }
}

/** 依關卡組出完整時間軸 */
export function buildTimeline(stage: StageDef, diff: number): TEvent[] {
  const R = makeRng(stage.id * 7919 + 17);
  const b = new Builder(R, diff);
  const len = stage.len;
  const midT = len * 0.5;
  b.ev.push({ t: 0.6, k: "banner", text: `STAGE ${stage.id}`, sub: stage.name });
  // 波次：使用該關卡的敵機池挑選樣板
  const has = (id: string) => stage.pool.includes(id);
  type Tpl = { w: number; min: number; run: (t: number, i: number) => number; ok: boolean };
  const tplsAll: Tpl[] = [
    { w: 3, min: 0, ok: has("scout"), run: (t, i) => b.scoutLine(t, i) },
    { w: 2, min: 0, ok: has("scout"), run: (t, i) => b.columns(t, i) },
    { w: 3, min: 0, ok: has("wing"), run: (t, i) => b.vee(t, i) },
    { w: 2, min: 0, ok: has("dart"), run: (t, i) => b.cross(t, i) },
    { w: 2, min: 0, ok: has("wing"), run: (t, i) => b.sine(t, i) },
    { w: 2, min: 0.05, ok: has("sentry"), run: (t, i) => b.sentries(t, i) },
    { w: 2, min: 0.05, ok: has("kami"), run: (t, i) => b.kamiRain(t, i) },
    { w: 2, min: 0.15, ok: has("turret"), run: (t, i) => b.turrets(t, i) },
    { w: 2, min: 0.2, ok: has("minelayer"), run: (t, i) => b.minelayer(t, i) },
    { w: 2, min: 0.2, ok: has("sniper"), run: (t, i) => b.snipers(t, i) },
    { w: 2, min: 0.2, ok: has("spinner"), run: (t, i) => b.spinner(t, i) },
    { w: 2, min: 0.25, ok: has("ghost"), run: (t, i) => b.ghosts(t, i) },
    { w: 2, min: 0.25, ok: has("aegis"), run: (t, i) => b.aegis(t, i) },
    { w: 1, min: 0.2, ok: has("orbiter"), run: (t, i) => b.orbiters(t, i) },
    { w: 2, min: 0.12, ok: stage.heavy.includes("heavy"), run: (t, i) => b.heavyWave(t, i) },
    { w: 1.4, min: 0.3, ok: stage.heavy.includes("cruiser"), run: (t, i) => b.cruiser(t, i) },
    { w: 1.2, min: 0.4, ok: stage.heavy.includes("carrier"), run: (t, i) => b.carrier(t, i) },
  ];
  const tpls = tplsAll.filter((x) => x.ok);

  const fill = (from: number, to: number, iFrom: number, iTo: number) => {
    let t = from;
    let last = -1;
    let guard = 0;
    while (t < to && guard++ < 200) {
      const i = iFrom + ((t - from) / Math.max(1, to - from)) * (iTo - iFrom);
      const cand = tpls.filter((x) => x.min <= i + 0.02);
      const tot = cand.reduce((s, x) => s + x.w, 0);
      let r = R() * tot;
      let idx = 0;
      for (let k = 0; k < cand.length; k++) {
        r -= cand[k].w;
        if (r <= 0) {
          idx = k;
          break;
        }
      }
      if (idx === last && cand.length > 1) idx = (idx + 1) % cand.length;
      last = idx;
      const dur = cand[idx].run(t, i);
      t += dur * (0.78 - i * 0.16);
      // 偶爾插入菁英
      if (R() < 0.14 + i * 0.1 && i > 0.15) {
        const pool = stage.pool.filter((e) => ["sentry", "spinner", "aegis", "sniper", "wing", "ghost"].includes(e));
        if (pool.length) b.eliteOf(t + 1, pool[Math.floor(R() * pool.length)]);
      }
    }
  };
  fill(1.6, midT - 7, 0.0, 0.5);
  // 第一次環境事件
  b.ev.push({ t: midT * 0.55, k: "event", name: stage.events[0], dur: 12 });
  b.ev.push({ t: midT - 3, k: "banner", text: "WARNING", sub: "中型敵艦接近" });
  b.ev.push({ t: midT, k: "mid" });
  b.ev.push({ t: midT + 0.01, k: "waitMid" });
  // 中王後半段
  const t2 = midT + 3;
  b.ev.push({ t: t2 + 0.5, k: "flyby", kind: stage.id % 3 === 0 ? "whale" : stage.id % 2 ? "ship" : "arc" });
  fill(t2 + 1, len - 8, 0.5, 1);
  b.ev.push({ t: t2 + (len - 8 - t2) * 0.4, k: "event", name: stage.events[stage.events.length - 1], dur: 12 });
  b.ev.push({ t: len - 4.5, k: "banner", text: "WARNING", sub: "巨大反應接近" });
  b.ev.push({ t: len, k: "boss" });
  b.ev.sort((a, c) => a.t - c.t);
  return b.ev;
}

// ---------------------------------------------------------------------------
// 無限模式：每個「區塊」約 18 秒，依等級動態組波；每 6 區塊出現中王，每 9 區塊出現 Boss
export const ENDLESS_POOL = ["scout", "dart", "wing", "sentry", "kami", "turret", "spinner", "minelayer", "sniper", "ghost", "aegis", "orbiter"];
export const ENDLESS_EVENTS = ["meteor", "lightning", "gale", "laserGrid", "torpedo"];
export const ENDLESS_BGS = ["ocean", "city", "ice", "volcano", "cyber", "space"];
export const ENDLESS_KINDS: BgKind[] = ["ocean", "city", "ice", "volcano", "cyber", "space"];

export function genEndlessChunk(chunk: number, startT: number, diff: number): TEvent[] {
  const R = makeRng(chunk * 104729 + 31);
  const b = new Builder(R, diff);
  const lvl = Math.min(1.6, chunk * 0.09);
  const i = Math.min(1, lvl);
  const ev = b.ev;
  const bossChunk = chunk > 0 && chunk % 9 === 8;
  const midChunk = chunk > 0 && chunk % 6 === 3;
  let t = startT;
  const pool = ENDLESS_POOL;
  const runs: ((t: number) => number)[] = [
    (tt) => b.scoutLine(tt, i),
    (tt) => b.vee(tt, i),
    (tt) => b.cross(tt, i),
    (tt) => b.sine(tt, i),
    (tt) => b.sentries(tt, i),
    (tt) => b.kamiRain(tt, i),
    (tt) => b.turrets(tt, i),
    (tt) => b.minelayer(tt, i),
    (tt) => b.snipers(tt, i),
    (tt) => b.spinner(tt, i),
    (tt) => b.ghosts(tt, i),
    (tt) => b.aegis(tt, i),
    (tt) => b.heavyWave(tt, i),
    (tt) => b.cruiser(tt, i),
    (tt) => b.carrier(tt, i),
  ];
  if (chunk === 0) ev.push({ t: startT + 0.5, k: "banner", text: "ENDLESS", sub: "無限模式・撐到最後" });
  const maxIdx = Math.min(runs.length, 5 + Math.floor(chunk * 0.9));
  const n = 3 + (chunk > 4 ? 1 : 0);
  for (let k = 0; k < n && t < startT + 15; k++) {
    const idx = Math.floor(R() * maxIdx);
    t += runs[idx](t) * (0.8 - i * 0.2);
    if (R() < 0.18 + i * 0.16) b.eliteOf(t, pool[Math.floor(R() * pool.length)]);
  }
  if (chunk % 4 === 2) ev.push({ t: startT + 4, k: "event", name: ENDLESS_EVENTS[Math.floor(R() * ENDLESS_EVENTS.length)], dur: 12 });
  if (midChunk) {
    ev.push({ t: startT + 12, k: "banner", text: "WARNING", sub: "中型敵艦接近" });
    ev.push({ t: startT + 15, k: "mid" });
    ev.push({ t: startT + 15.01, k: "waitMid" });
  }
  if (bossChunk) {
    ev.push({ t: startT + 12, k: "banner", text: "WARNING", sub: "巨大反應接近" });
    ev.push({ t: startT + 15, k: "boss" });
  }
  if (chunk % 5 === 4) ev.push({ t: startT + 6, k: "flyby", kind: ["ship", "whale", "arc"][chunk % 3] });
  ev.sort((a, c) => a.t - c.t);
  return ev;
}
