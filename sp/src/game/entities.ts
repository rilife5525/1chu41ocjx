// 實體型別與物件池（Object Pool）：子彈／敵機／粒子皆重複使用，避免 GC 抖動
import type { EquipItem } from "./types";

export class Pool<T extends { alive: boolean }> {
  items: T[] = [];
  free: T[] = [];
  constructor(private make: () => T) {}
  spawn(): T {
    const o = this.free.pop() || this.make();
    o.alive = true;
    this.items.push(o);
    return o;
  }
  /** 以交換移除法回收（請配合倒序迭代使用） */
  kill(i: number) {
    const o = this.items[i];
    o.alive = false;
    const last = this.items.pop()!;
    if (i < this.items.length) this.items[i] = last;
    this.free.push(o);
  }
  clear() {
    for (const o of this.items) {
      o.alive = false;
      this.free.push(o);
    }
    this.items.length = 0;
  }
}

// -------- 我方子彈 --------
export interface PBullet {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dmg: number;
  pierce: number;
  life: number;
  t: number;
  style: number; // 精靈樣式編號
  kind: number; // 特殊行為
  homing: number;
  explode: number; // 爆炸半徑
  chain: number; // 電弧跳躍次數
  burn: number;
  slow: number;
  ramp: number; // 穿透增傷
  rot: number;
  spin: number;
  a: number;
  b: number;
  c: number;
  scale: number;
  src: number; // 0 主武器 1 僚機 2 技能
  hits: number[];
}
export const makePB = (): PBullet => ({
  alive: false, x: 0, y: 0, vx: 0, vy: 0, r: 4, dmg: 1, pierce: 0, life: 2, t: 0, style: 0, kind: 0, homing: 0, explode: 0, chain: 0, burn: 0, slow: 0, ramp: 0, rot: 0, spin: 0, a: 0, b: 0, c: 0, scale: 1, src: 0, hits: [],
});

// -------- 敵方子彈 --------
export interface EBullet {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: number;
  color: number;
  ang: number;
  acc: number; // 速度倍率（每秒）
  turn: number; // 角速度
  life: number;
  t: number;
  mode: number; // 0 直線 1 加速 2 轉向 3 地雷 4 延遲起動 5 波動
  a: number;
  b: number;
  grazed: boolean;
  dmg: number;
  spd: number;
  slow: number;
}
export const makeEB = (): EBullet => ({
  alive: false, x: 0, y: 0, vx: 0, vy: 0, r: 5, type: 0, color: 0, ang: 0, acc: 0, turn: 0, life: 9, t: 0, mode: 0, a: 0, b: 0, grazed: false, dmg: 10, spd: 0, slow: 1,
});

// -------- 敵機 --------
export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  r: number;
  spd: number;
  score: number;
  exp: number;
  ai: string;
  size: number; // 精靈大小（像素）
  ground?: boolean;
  mid?: boolean;
}
export interface Enemy {
  alive: boolean;
  dead: boolean;
  uid: number;
  def: EnemyDef;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  r: number;
  t: number;
  flash: number;
  a: number;
  b: number;
  c: number;
  d: number;
  tm: number[];
  ph: number;
  elite: boolean;
  burn: number;
  slow: number;
  brand: number;
  dir: number;
  alpha: number;
  invuln: boolean;
  boss: boolean;
  bossId: number;
  theme: number;
  scale: number;
  freeze: number;
  hpBar: number;
  fireMul: number;
  mark: number;
}
export const makeEnemy = (): Enemy => ({
  alive: false, dead: false, uid: 0, def: null as unknown as EnemyDef, x: 0, y: 0, vx: 0, vy: 0, hp: 1, maxHp: 1, shield: 0, maxShield: 0, r: 12, t: 0, flash: 0, a: 0, b: 0, c: 0, d: 0, tm: [0, 0, 0, 0, 0, 0, 0, 0], ph: 0, elite: false, burn: 0, slow: 0, brand: 0, dir: 1, alpha: 1, invuln: false, boss: false, bossId: 0, theme: 0, scale: 1, freeze: 0, hpBar: 0, fireMul: 1, mark: 0,
});

// -------- 拾取物 --------
export const PK = { EXP: 0, COIN: 1, POWER: 2, HEAL: 3, ULT: 4, SHIELD: 5, MAGNET: 6, GEAR: 7, CORE: 8 };
export interface Pickup {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: number;
  v: number;
  t: number;
  mag: boolean;
  item?: EquipItem;
}
export const makePickup = (): Pickup => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, kind: 0, v: 1, t: 0, mag: false });

// -------- 粒子／文字／光束 --------
export interface Particle {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  size2: number;
  spr: HTMLCanvasElement | null;
  color: string;
  a0: number;
  drag: number;
  grav: number;
  rot: number;
  vr: number;
  kind: number; // 0 光暈 1 火花線 2 環 3 碎片 4 煙
  w: number;
}
export const makeParticle = (): Particle => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 1, max: 1, size: 4, size2: 0, spr: null, color: "#fff", a0: 1, drag: 0, grav: 0, rot: 0, vr: 0, kind: 0, w: 2 });

export interface FloatText {
  alive: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  color: string;
  size: number;
}
export const makeText = (): FloatText => ({ alive: false, x: 0, y: 0, vy: -40, life: 1, max: 1, text: "", color: "#fff", size: 14 });

/** 敵方雷射／光束：先預警再發射 */
export interface Beam {
  alive: boolean;
  x: number;
  y: number;
  ang: number;
  rot: number; // 旋轉角速度
  len: number;
  w: number;
  warn: number;
  life: number;
  t: number;
  dmg: number;
  color: string;
  follow: Enemy | null;
  ox: number;
  oy: number;
}
export const makeBeam = (): Beam => ({ alive: false, x: 0, y: 0, ang: 0, rot: 0, len: 1400, w: 30, warn: 0.8, life: 1, t: 0, dmg: 20, color: "#ff3b6b", follow: null, ox: 0, oy: 0 });

/** 技能特效物件：由各機體技能模組建立，自行更新與繪製 */
export interface Fx {
  alive: boolean;
  layer: 0 | 1 | 2; // 0 於敵機下方 1 於敵機／我機上方 2 螢幕層（最上）
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}
