// 遊戲全域常數
export const W = 540; // 邏輯寬度
export const H = 960; // 邏輯高度
export const TAU = Math.PI * 2;

export const SAVE_KEY = "zenith-riot-save-v1";

// 設計系統色彩（與 CSS 變數一致）
export const COLOR = {
  ink: "#08080c",
  red: "#e8112d",
  red2: "#ff3b52",
  bone: "#f6f1e7",
  gold: "#f2c14e",
  cyan: "#45d6ff",
};

export const RARITY_COLOR: Record<string, string> = {
  R: "#9aa6b6",
  SR: "#47c2ff",
  SSR: "#ffc23d",
  UR: "#ff3b6b",
};

// 難度倍率
export const DIFFS = [
  { name: "普通", en: "NORMAL", hp: 1, bul: 1, spd: 1, reward: 1, color: "#45d6ff" },
  { name: "困難", en: "HARD", hp: 1.8, bul: 1.25, spd: 1.1, reward: 1.8, color: "#ffc23d" },
  { name: "惡夢", en: "NIGHTMARE", hp: 3, bul: 1.5, spd: 1.2, reward: 3, color: "#ff3b52" },
];

// 效能分級設定
export const QUALITY = {
  high: { dpr: 2, particles: 1100, pMul: 1, bgLayers: 3, lens: true, glowText: true },
  mid: { dpr: 1.5, particles: 650, pMul: 0.65, bgLayers: 2, lens: true, glowText: true },
  low: { dpr: 1, particles: 340, pMul: 0.38, bgLayers: 1, lens: false, glowText: false },
};
export type QualityKey = keyof typeof QUALITY;

// 數學工具
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (a = 1, b?: number) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randi = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const easeInOut = (t: number) => {
  t = clamp(t, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const dist2 = (ax: number, ay: number, bx: number, by: number) => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

// 種子亂數（關卡腳本需可重現）
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
